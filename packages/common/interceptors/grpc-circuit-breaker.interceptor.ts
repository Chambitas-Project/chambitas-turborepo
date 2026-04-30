import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable, from, throwError, catchError } from 'rxjs';
import CircuitBreaker from 'opossum';

@Injectable()
export class GrpcCircuitBreakerInterceptor implements NestInterceptor {
  private breakers: Map<string, CircuitBreaker> = new Map();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodName = context.getHandler().name;

    if (!this.breakers.has(methodName)) {
      const options = {
        timeout: 5000, // 5 seconds as per guidelines
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
      };

      const breaker = new CircuitBreaker(
        () => next.handle().toPromise(),
        options,
      );

      breaker.fallback(() => {
        throw new ServiceUnavailableException(
          `Service currently unavailable (Circuit Open for ${methodName})`,
        );
      });

      this.breakers.set(methodName, breaker);
    }

    const breaker = this.breakers.get(methodName);
    return from(breaker!.fire()).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
