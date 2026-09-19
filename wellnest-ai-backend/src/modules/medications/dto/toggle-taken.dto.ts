import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ToggleTakenDto {
  @ApiPropertyOptional({ description: 'Defaults to today (server date) when omitted', example: '2026-09-12' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
