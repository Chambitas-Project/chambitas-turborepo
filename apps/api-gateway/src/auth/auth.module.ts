import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PROTO_PACKAGE, PROTO_PATH } from '@chambitas/proto';
import { SupabaseModule } from '@chambitas/supabase';
import { AuthController } from './auth.controller';
import { UniversityEmailValidator } from './validators/university-email.validator';

@Module({
  imports: [
    SupabaseModule,
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.AUTH,
          protoPath: PROTO_PATH.AUTH,
          url: process.env.AUTH_SERVICE_GRPC_URL || 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [UniversityEmailValidator],
  exports: [ClientsModule],
})
export class AuthModule {}
