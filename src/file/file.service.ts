/// <reference types="multer" />
import { Injectable } from '@nestjs/common';
import { FileResponse } from './file.interface';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
    async saveFiles(files: Express.Multer.File[], folder: string = 'products') {
        const uploadFolder = `${path}/uploads/${folder}`;

        await ensureDir(uploadFolder);

        const response: FileResponse[] = await Promise.all(files.map(async (file) => {
            const fileName = `${uuidv4()}-${file.originalname}`;
            const filePath = `${uploadFolder}/${fileName}`;
            await writeFile(filePath, file.buffer);
            return {
                url: `/uploads/${folder}/${fileName}`,
                name: fileName,
            };
        }));
        return response;
    }
}
