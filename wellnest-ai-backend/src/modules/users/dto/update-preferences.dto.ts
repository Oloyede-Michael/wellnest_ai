import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  medicationReminders?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  caregiverNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  biometricLock?: boolean;
}
