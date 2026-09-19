import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TranslateDiagnosisDto {
  @ApiProperty({ example: 'Hypertension' })
  @IsString()
  term!: string;
}
