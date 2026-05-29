import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BullModule } from '@nestjs/bullmq';
import { SupabaseModule } from '@chambitas/supabase';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { ScoringProcessor } from './scoring.processor';
import { PROTO_PATH } from '@chambitas/proto';

@Module({
  imports: [
    SupabaseModule,
    BullModule.registerQueue({
      name: 'ml-scoring-queue',
    }),
    ClientsModule.register([
      {
        name: 'ML_ENGINE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'ml_engine',
          protoPath: PROTO_PATH.ML_ENGINE,
          url: process.env.ML_ENGINE_GRPC_URL || 'localhost:50058',
        },
      },
    ]),
  ],
  controllers: [MatchingController],
  providers: [MatchingService, ScoringProcessor],
})
export class MatchingModule { }
