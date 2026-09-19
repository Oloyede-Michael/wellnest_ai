import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UserPreference } from '../database/entities/user-preference.entity';
import { EmergencyProfile } from '../database/entities/emergency-profile.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPreference, EmergencyProfile])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
