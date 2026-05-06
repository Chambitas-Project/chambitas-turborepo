import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable, from, throwError, catchError, retry, timer } from 'rxjs';
import CircuitBreaker from 'opossum';

@Injectable()
export class GrpcCircuitBreakerInterceptor implements NestInterceptor {
  private breakers: Map<string, CircuitBreaker> = new Map();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const targetName = context.getClass().name;
    const methodName = context.getHandler().name;
    const breakerKey = `${targetName}:${methodName}`;

    if (!this.breakers.has(breakerKey)) {
      const options = {
        timeout: 3000, // Reducido a 3s para fallos más rápidos
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
      };

      // Nota: Opossum requiere una función que devuelva una promesa.
      // Seguimos usando defer para convertir el handle en promesa solo cuando el breaker dispara.
      const breaker = new CircuitBreaker(
        (handler: CallHandler) => handler.handle().toPromise(),
        options,
      );

      breaker.fallback(() => {
        throw new ServiceUnavailableException(
          `Service currently unavailable (Circuit Open for ${breakerKey})`,
        );
      });

      this.breakers.set(breakerKey, breaker);
    }

    const breaker = this.breakers.get(breakerKey);

    return from(breaker!.fire(next)).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000), // Exponential backoff
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
