import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Tolu Johnson' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Daughter' })
  @IsString()
  relation!: string;

  @ApiProperty({ example: '+1 416 555 0148' })
  @IsString()
  phone!: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}
