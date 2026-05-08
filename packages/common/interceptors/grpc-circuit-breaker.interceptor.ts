import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { Observable, from, throwError, catchError, firstValueFrom } from 'rxjs';
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
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        // Filtramos errores: si retorna true, NO cuenta como fallo para el circuito
        errorFilter: (err: any) => {
          const infraCodes = [4, 13, 14]; // DEADLINE_EXCEEDED, INTERNAL, UNAVAILABLE
          if (err?.code && !infraCodes.includes(err.code)) {
            return true; 
          }
          // Si es un error de validación (400) o similar lanzado por Nest, también lo ignoramos
          if (err?.status && err.status < 500) {
            return true;
          }
          return false;
        },
      };

      const breaker = new CircuitBreaker(
        (handler: CallHandler) => firstValueFrom(handler.handle()),
        options,
      );

      breaker.fallback((error) => {
        // El fallback solo se ejecuta cuando el circuito está abierto o falló el fire.
        // Si el circuito está abierto, lanzamos ServiceUnavailableException.
        if (breaker.opened) {
          throw new ServiceUnavailableException(
            `Service currently unavailable (Circuit Open for ${breakerKey})`,
          );
        }
        // Si no está abierto pero falló, relanzamos el error original para que llegue al filtro global
        throw error;
      });

      this.breakers.set(breakerKey, breaker);
    }

    const breaker = this.breakers.get(breakerKey);

    return from(breaker!.fire(next)).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
