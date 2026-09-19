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

/** Standalone connection (outside the Nest app context) used by the seed script. */
export const AppDataSource = new DataSource(
  config.db.type === 'sqlite'
    ? {
        type: 'sqlite',
        database: config.db.database || 'wellnest.sqlite',
        entities: [
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
        ],
        synchronize: config.nodeEnv !== 'production',
      }
    : {
        type: 'mysql',
        host: config.db.host,
        port: config.db.port,
        username: config.db.username,
        password: config.db.password,
        database: config.db.database,
        entities: [
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
        ],
        synchronize: config.nodeEnv !== 'production',
      },
);
