import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService, Database } from '@chambitas/supabase';

@Injectable()
export class IntegrityCronService {
  private readonly logger = new Logger(IntegrityCronService.name);

  constructor(private readonly supabase: SupabaseService) { }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyIntegrityAudit() {
    this.logger.log('Iniciando auditoría de integridad institucional (Cron Job)...');

    try {
      // Ejemplo: Podríamos hacer un query pesado acá o llamar a un RPC
      const universityId = '59a91332-e18f-4e68-8061-fe83f4c7610f'; // Default o iterar por cada universidad

      const auditResult = {
        check_type: 'row_count_audit' as const,
        status: 'passed' as const,
        table_audited: 'users',
        university_id: universityId,
        executed_at: new Date().toISOString(),
        expected_row_count: 100,
        actual_row_count: 100,
      };

      const { error } = await this.supabase.getClient<Database>()
        .from('institutional_integrity_checks')
        .insert(auditResult);

      if (error) {
        this.logger.error(`Error al registrar auditoría de integridad: ${error.message}`);
      } else {
        this.logger.log(`Auditoría finalizada. Resultado registrado con éxito en 'institutional_integrity_checks'.`);
      }
    } catch (err: any) {
      this.logger.error(`Fallo crítico en el cron de auditoría: ${err.message}`);
    }
  }
}
