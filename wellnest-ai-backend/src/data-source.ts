import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './config/environment';
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
} from './modules/database/entities';

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

const sslOptions =
  config.db.type === 'postgres' && config.db.ssl
    ? { ssl: { rejectUnauthorized: false } }
    : {};

/** Standalone connection (outside the Nest app context) used by the seed script. */
export const AppDataSource = new DataSource(
  config.db.type === 'sqlite'
    ? {
        type: 'sqlite',
        database: config.db.database || 'wellnest.sqlite',
        entities: ENTITIES,
        synchronize: config.nodeEnv !== 'production',
      }
    : config.db.type === 'postgres'
      ? {
          type: 'postgres',
          ...(config.db.url ? { url: config.db.url } : {}),
          host: config.db.host,
          port: config.db.port,
          username: config.db.username,
          password: config.db.password,
          database: config.db.database,
          entities: ENTITIES,
          synchronize: config.nodeEnv !== 'production',
          ...sslOptions,
        }
      : {
          type: 'mysql',
          host: config.db.host,
          port: config.db.port,
          username: config.db.username,
          password: config.db.password,
          database: config.db.database,
          entities: ENTITIES,
          synchronize: config.nodeEnv !== 'production',
        },
);
