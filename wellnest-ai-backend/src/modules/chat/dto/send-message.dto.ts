import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'What does hypertension mean exactly?' })
  @IsString()
  @MinLength(1)
  text!: string;
}
