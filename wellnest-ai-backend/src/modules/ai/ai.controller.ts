import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DiagnosisTranslatorService } from './diagnosis-translator.service';
import { TranslateDiagnosisDto } from './dto/translate-diagnosis.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly diagnosisTranslator: DiagnosisTranslatorService) {}

  @Post('translate')
  @ApiOperation({ summary: 'Translate a medical term into plain language (PRD feature P0-2)' })
  translate(@Body() dto: TranslateDiagnosisDto) {
    const data = this.diagnosisTranslator.translate(dto.term);
    return { status: 'success', message: 'Diagnosis translation', data };
  }
}
