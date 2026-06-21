import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '@chambitas/supabase';
import { PROTO_PACKAGE, PROTO_PATH } from '@chambitas/proto';

@Module({
  imports: [
    SupabaseModule,
    ClientsModule.register([
      {
        name: 'ANALYTICS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.ANALYTICS,
          protoPath: PROTO_PATH.ANALYTICS,
          url: process.env.ANALYTICS_AUDIT_SERVICE_GRPC_URL || 'localhost:50057',
          loader: { keepCase: true },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
