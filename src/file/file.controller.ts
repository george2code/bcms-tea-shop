import { Controller, HttpCode, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileService } from './file.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @HttpCode(200)
  @Post()
  @UseInterceptors(FileInterceptor('files'))
  @Auth()
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[], 
    @Query('folder') folder?: string
  ) {
    return this.fileService.saveFiles(files, folder);
  }
}
function FileInterceptor(arg0: string): any {
  throw new Error('Function not implemented.');
}
