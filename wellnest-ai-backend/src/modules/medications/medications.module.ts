import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationBlock } from '../database/entities/medication-block.entity';
import { MedicationItem } from '../database/entities/medication-item.entity';
import { MedicationDoseLog } from '../database/entities/medication-dose-log.entity';
import { HealthEvent } from '../database/entities/health-event.entity';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicationBlock, MedicationItem, MedicationDoseLog, HealthEvent])],
  controllers: [MedicationsController],
  providers: [MedicationsService],
  exports: [MedicationsService],
})
export class MedicationsModule {}
