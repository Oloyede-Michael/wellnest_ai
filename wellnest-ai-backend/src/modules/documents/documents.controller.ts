import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { DocumentsService } from './documents.service';
import { APP_CONSTANTS } from '../../config/constants';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @ApiOperation({ summary: 'Upload one or more medical documents (scan/upload/PDF) for AI analysis' })
  async upload(@CurrentUserId() userId: string, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files provided');
    const data = await this.documentsService.uploadAndAnalyze(userId, files);
    return { status: 'success', message: APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOADED, data };
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded documents' })
  async list(@CurrentUserId() userId: string) {
    const data = await this.documentsService.list(userId);
    return { status: 'success', message: 'Documents', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single document with its extracted data' })
  async getOne(@CurrentUserId() userId: string, @Param('id') id: string) {
    const data = await this.documentsService.getById(userId, id);
    return { status: 'success', message: 'Document', data };
  }
}
