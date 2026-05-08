import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator,
    ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { SupabaseService, Database } from '@chambitas/supabase';
import { UNIVERSITY_EMAIL_PATTERNS } from '@chambitas/common';

@ValidatorConstraint({ name: 'UniversityEmail', async: true })
@Injectable()
export class UniversityEmailValidator implements ValidatorConstraintInterface {
    constructor(private readonly supabaseService: SupabaseService) { }

    async validate(email: string, args: ValidationArguments) {
        const dto = args.object as any;

        // BYPASS: Los employers no tienen email institucional — cualquier email es válido para ellos
        if (dto.role && dto.role !== 'student') {
            return true;
        }

        // Extraer university_id del DTO
        const universityId = dto.university_id || dto.universityId;
        const cleanEmail = email?.trim();

        // Si es student y no hay university_id, fallar (debería estar validado por @ValidateIf)
        if (!universityId || !cleanEmail) {
            console.warn('[UniversityEmailValidator] Missing universityId or email for student role.');
            return false;
        }

        try {
            const { data: university, error } = await this.supabaseService
                .getClient<Database>()
                .from('universities')
                .select('email_domain, slug')
                .eq('id', universityId)
                .single();

            if (error || !university) {
                console.error('[UniversityEmailValidator] University not found or DB error:', error?.message);
                return false;
            }

            const parts = cleanEmail.split('@');
            if (parts.length !== 2) return false;

            const [localPart, domain] = parts;

            // Validación de dominio (anti-spoofing)
            if (domain!.toLowerCase() !== university.email_domain.toLowerCase()) {
                console.warn(`[UniversityEmailValidator] Domain mismatch: expected ${university.email_domain}, got ${domain}`);
                return false;
            }

            // Validación de patrón regex institucional (si existe)
            if (university.slug) {
                const slugKey = university.slug.toUpperCase();
                const pattern = UNIVERSITY_EMAIL_PATTERNS[slugKey];
                if (pattern) {
                    const isValid = pattern.test(localPart!);
                    if (!isValid) {
                        console.warn(`[UniversityEmailValidator] Regex failed for ${slugKey}, localPart: ${localPart}`);
                    }
                    return isValid;
                }
            }

            return true;
        } catch (err) {
            console.error('[UniversityEmailValidator] Unexpected error:', err);
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'El email no es válido para la universidad seleccionada o no cumple los requisitos institucionales.';
    }
}


export function IsUniversityEmail(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: UniversityEmailValidator,
        });
    };
}
