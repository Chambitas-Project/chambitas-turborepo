import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SupabaseModule } from '@chambitas/supabase';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [
    SupabaseModule,
    ClientsModule.register([
      {
        name: 'ML_ENGINE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'ml_engine',
          protoPath: join(__dirname, '../../../../packages/proto/ml-engine.proto'),
          url: process.env.ML_ENGINE_GRPC_URL || 'localhost:50058',
        },
      },
    ]),
  ],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule { }
