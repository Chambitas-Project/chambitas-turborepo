import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable, from, throwError, catchError, firstValueFrom } from 'rxjs';
import CircuitBreaker from 'opossum';

/**
 * Códigos gRPC que corresponden a errores de NEGOCIO (no de infraestructura).
 * Estos errores NO deben abrir el Circuit Breaker.
 *
 * 3  = INVALID_ARGUMENT    → Validación fallida, payload incorrecto
 * 5  = NOT_FOUND           → Recurso no encontrado
 * 6  = ALREADY_EXISTS      → Conflicto (usuario duplicado, etc.)
 * 7  = PERMISSION_DENIED   → Sin permisos sobre el recurso
 * 9  = FAILED_PRECONDITION → Precondición de negocio no cumplida
 * 16 = UNAUTHENTICATED     → Token inválido/ausente
 */
const BUSINESS_ERROR_CODES = new Set([3, 5, 6, 7, 9, 16]);

@Injectable()
export class GrpcCircuitBreakerInterceptor implements NestInterceptor {
  private breakers: Map<string, CircuitBreaker> = new Map();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const targetName = context.getClass().name;
    const methodName = context.getHandler().name;
    const breakerKey = `${targetName}:${methodName}`;

    if (!this.breakers.has(breakerKey)) {
      const options = {
        // Timeout incrementado para onboarding (múltiples queries + potencial RPC de Supabase).
        // Las guidelines recomiendan 3s, pero el onboarding es una transacción pesada.
        // Reducir a 3-5s una vez implementada la función PL/pgSQL atómica en Supabase.
        timeout: 15000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        /**
         * errorFilter: retorna true → el error es ignorado (NO cuenta como fallo de infraestructura).
         *
         * LÓGICA CORRECTA:
         * - Errores de NEGOCIO (business codes): se ignoran → el circuito NO se abre.
         * - Errores de INFRAESTRUCTURA (INTERNAL=13, UNAVAILABLE=14, DEADLINE_EXCEEDED=4):
         *   cuentan como fallos reales → el circuito SÍ puede abrirse.
         */
        errorFilter: (err: any) => {
          // Error gRPC con código de negocio → ignorar para el breaker
          if (err?.code !== undefined && BUSINESS_ERROR_CODES.has(err.code)) {
            return true;
          }
          // HTTP 4xx desde NestJS (ej: ValidationPipe, JwtAuthGuard) → ignorar
          if (err?.status !== undefined && err.status >= 400 && err.status < 500) {
            return true;
          }
          // Cualquier otro error (INTERNAL=13, UNAVAILABLE=14, DEADLINE_EXCEEDED=4)
          // → cuenta como fallo de infraestructura y puede abrir el circuito
          return false;
        },
      };

      const breaker = new CircuitBreaker(
        (handler: CallHandler) => firstValueFrom(handler.handle()),
        options,
      );

      breaker.fallback((error) => {
        if (breaker.opened) {
          throw new ServiceUnavailableException(
            `Service temporarily unavailable (Circuit Open: ${breakerKey}). Please retry in a moment.`,
          );
        }
        // Circuito cerrado pero la llamada falló → relanzar para que llegue al GlobalRpcExceptionFilter
        throw error;
      });

      this.breakers.set(breakerKey, breaker);
    }

    const breaker = this.breakers.get(breakerKey)!;

    return from(breaker.fire(next)).pipe(
      catchError((err) => throwError(() => err)),
    );
  }
}

