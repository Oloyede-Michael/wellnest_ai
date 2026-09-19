import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  UserPreference,
  Vital,
  MedicalDocument,
  MedicationBlock,
  MedicationItem,
  MedicationDoseLog,
  HealthEvent,
  CaregiverLink,
  EmergencyProfile,
  EmergencyContact,
  ChatMessage,
} from './entities';

const ENTITIES = [
  User,
  UserPreference,
  Vital,
  MedicalDocument,
  MedicationBlock,
  MedicationItem,
  MedicationDoseLog,
  HealthEvent,
  CaregiverLink,
  EmergencyProfile,
  EmergencyContact,
  ChatMessage,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE') || 'sqlite';
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite' as const,
            database: configService.get<string>('DB_DATABASE') || 'wellnest.sqlite',
            entities: ENTITIES,
            synchronize: configService.get<string>('NODE_ENV') !== 'production',
            logging: configService.get<string>('NODE_ENV') === 'development',
          };
        }
        if (dbType === 'postgres') {
          const databaseUrl = configService.get<string>('DATABASE_URL') || '';
          const sslEnabled = configService.get<string>('DB_SSL') !== 'false';
          return {
            type: 'postgres' as const,
            ...(databaseUrl ? { url: databaseUrl } : {}),
            host: configService.get<string>('DB_HOST') || 'localhost',
            port: configService.get<number>('DB_PORT') || 5432,
            username: configService.get<string>('DB_USERNAME') || 'postgres',
            password: configService.get<string>('DB_PASSWORD') || '',
            database: configService.get<string>('DB_NAME') || 'wellnest_ai',
            entities: ENTITIES,
            synchronize: configService.get<string>('NODE_ENV') !== 'production',
            logging: configService.get<string>('NODE_ENV') === 'development',
            ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
            extra: {
              max: 10,
            },
            retryAttempts: 3,
            retryDelay: 3000,
          };
        }
        return {
          type: 'mysql' as const,
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get<number>('DB_PORT') || 3306,
          username: configService.get<string>('DB_USERNAME') || 'root',
          password: configService.get<string>('DB_PASSWORD') || '',
          database: configService.get<string>('DB_NAME') || 'wellnest_ai',
          entities: ENTITIES,
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') === 'development',
          extra: {
            connectionLimit: 10,
          },
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
