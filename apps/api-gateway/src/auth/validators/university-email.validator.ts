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

@ValidatorConstraint({ async: true })
@Injectable()
export class UniversityEmailValidator implements ValidatorConstraintInterface {
    constructor(private readonly supabaseService: SupabaseService) { }

    async validate(email: string, args: ValidationArguments) {
        const { university_id } = args.object as any;

        if (!university_id || !email) {
            return false;
        }

        // 1. Fetch University from DB
        const { data: university, error } = await this.supabaseService
            .getClient<Database>()
            .from('universities')
            .select('email_domain, slug')
            .eq('id', university_id)
            .single();

        if (error || !university) {
            return false;
        }

        // 2. Validate Domain (Anti-Spoofing)
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        
        const [localPart, domain] = parts;
        if (domain !== university.email_domain) {
            return false;
        }

        // 3. Regex Logic based on Slug
        if (university.slug) {
            const pattern = UNIVERSITY_EMAIL_PATTERNS[university.slug];
            if (pattern) {
                return pattern.test(localPart!);
            }
        }

        // Default allow if no pattern defined (fallback)
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Email is invalid for the selected university or does not match requirements.';
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
