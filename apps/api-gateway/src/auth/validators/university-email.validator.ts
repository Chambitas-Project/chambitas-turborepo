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
        // Extraction of University ID (priority: snake_case to match DTO, then camelCase)
        const universityId = dto.university_id || dto.universityId;

        // Clean email
        const cleanEmail = email?.trim();

        console.group('🔍 UniversityEmailValidator Debug');
        console.log('1. Full DTO Keys:', Object.keys(dto));
        console.log('2. university_id value:', dto.university_id);
        console.log('3. universityId value:', dto.universityId);
        console.log('4. Email value:', email);

        if (!universityId || !cleanEmail) {
            console.warn('❌ Validation failed: Missing University ID or Email');
            console.groupEnd();
            return false;
        }

        try {
            // 2. Fetch University from DB (Anti-Spoofing)
            const { data: university, error } = await this.supabaseService
                .getClient<Database>()
                .from('universities')
                .select('email_domain, slug')
                .eq('id', universityId)
                .single();

            if (error || !university) {
                console.error('❌ DB Error or University not found:', error?.message);
                console.groupEnd();
                return false;
            }

            console.log('4. DB University Found:', university);

            // 3. Separate email into localPart and domain
            const parts = cleanEmail.split('@');
            if (parts.length !== 2) {
                console.warn('❌ Invalid email format');
                console.groupEnd();
                return false;
            }
            const [localPart, domain] = parts;
            console.log('5. Domain from Email:', domain);

            // 4. Domain Anti-Spoofing (Case-Insensitive)
            if (domain!.toLowerCase() !== university.email_domain.toLowerCase()) {
                console.warn(`❌ Domain mismatch! Expected: ${university.email_domain}, Got: ${domain}`);
                console.groupEnd();
                return false;
            }

            // 5. Slug-based Patterns (Case-Insensitive lookup)
            if (university.slug) {
                const slugKey = university.slug.toUpperCase();
                const pattern = UNIVERSITY_EMAIL_PATTERNS[slugKey];
                
                if (pattern) {
                    console.log(`6. Testing Regex Pattern for ${slugKey}:`, pattern.toString());
                    const isValid = pattern.test(localPart!);
                    console.log('7. Regex result for localPart:', isValid);
                    console.groupEnd();
                    return isValid;
                }
            }

            console.log('✅ No specific pattern defined for this slug, domain is valid.');
            console.groupEnd();
            return true;
        } catch (err) {
            console.error('❌ Unexpected error in UniversityEmailValidator:', err);
            console.groupEnd();
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'Email is invalid for the selected university or does not match institutional requirements.';
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
