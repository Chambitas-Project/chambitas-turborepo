import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
  GatewayTimeoutException,
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
        timeout: 10000, // Aumentado a 10s según requerimiento
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
      };

      const breaker = new CircuitBreaker(
        (handler: CallHandler) => handler.handle().toPromise(),
        options,
      );

      breaker.fallback((error) => {
        if (error?.message?.includes('Timed out')) {
          throw new GatewayTimeoutException(
            `Service ${targetName}.${methodName} timed out after 10s`,
          );
        }
        throw new ServiceUnavailableException(
          `Service currently unavailable (Circuit Open for ${breakerKey})`,
        );
      });

      this.breakers.set(breakerKey, breaker);
    }

    const breaker = this.breakers.get(breakerKey);

    return from(breaker!.fire(next)).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 500),
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
