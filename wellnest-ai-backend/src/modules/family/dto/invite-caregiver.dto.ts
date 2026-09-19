import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class InviteCaregiverDto {
  @ApiProperty({ example: 'tolu@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: 'Tolu Johnson' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Daughter' })
  @IsOptional()
  @IsString()
  relation?: string;

  @ApiPropertyOptional({ example: 'full', enum: ['full', 'appointments', 'medications'] })
  @IsOptional()
  @IsIn(['full', 'appointments', 'medications'])
  accessLevel?: 'full' | 'appointments' | 'medications';
}
