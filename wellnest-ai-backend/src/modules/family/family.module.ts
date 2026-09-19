import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaregiverLink } from '../database/entities/caregiver-link.entity';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaregiverLink])],
  controllers: [FamilyController],
  providers: [FamilyService],
})
export class FamilyModule {}
