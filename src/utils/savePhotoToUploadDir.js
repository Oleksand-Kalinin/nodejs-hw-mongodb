import path from 'node:path';
import fs from 'node:fs/promises';
import { PHOTO_DIR, TEMP_UPLOAD_DIR } from '../constants/index.js';
import { env } from './env.js';

export const savePhotoToUploadDir = async (file) => {
    await fs.rename(
        path.join(TEMP_UPLOAD_DIR, file.filename),
        path.join(PHOTO_DIR, file.filename),
    );

    return `${env('APP_DOMAIN')}/photo/${file.filename}`;
};
