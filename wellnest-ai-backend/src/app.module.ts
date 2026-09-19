import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { ChatModule } from './modules/chat/chat.module';
import { FamilyModule } from './modules/family/family.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { AiModule } from './modules/ai/ai.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DocumentsModule,
    MedicationsModule,
    ChatModule,
    FamilyModule,
    TimelineModule,
    EmergencyModule,
    AiModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
