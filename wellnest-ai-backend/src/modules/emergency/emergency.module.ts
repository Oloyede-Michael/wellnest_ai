import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyProfile } from '../database/entities/emergency-profile.entity';
import { EmergencyContact } from '../database/entities/emergency-contact.entity';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmergencyProfile, EmergencyContact])],
  controllers: [EmergencyController],
  providers: [EmergencyService],
})
export class EmergencyModule {}
