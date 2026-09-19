import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'sarah@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Sarah Johnson' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'patient', enum: ['patient', 'caregiver'] })
  @IsIn(['patient', 'caregiver'])
  role!: 'patient' | 'caregiver';
}
