import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Hypertension' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Stage 1' })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiPropertyOptional({ example: 'Jun 22' })
  @IsOptional()
  @IsString()
  nextAppointmentDate?: string;

  @ApiPropertyOptional({ example: '9:00 AM' })
  @IsOptional()
  @IsString()
  nextAppointmentTime?: string;

  @ApiPropertyOptional({ example: 'Dr. Patel · Cardiology' })
  @IsOptional()
  @IsString()
  nextAppointmentWith?: string;
}
