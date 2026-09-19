import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateAccessDto {
  @ApiProperty({ example: 'appointments', enum: ['full', 'appointments', 'medications'] })
  @IsIn(['full', 'appointments', 'medications'])
  accessLevel!: 'full' | 'appointments' | 'medications';
}
