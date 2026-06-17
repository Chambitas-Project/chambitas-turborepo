import { SetMetadata } from '@nestjs/common';

export const OWNER_FIELD_KEY = 'ownerField';
/**
 * Decorador para indicar qué campo del payload gRPC contiene el ID del propietario.
 * @param fieldName Nombre del campo (ej. 'userId', 'id', 'employer_id')
 */
export const CheckOwner = (fieldName: string) => SetMetadata(OWNER_FIELD_KEY, fieldName);
