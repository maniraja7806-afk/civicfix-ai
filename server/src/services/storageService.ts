import { cloudinary } from '../config/cloudinary';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import fs from 'fs';

export const saveUploadedFile = async (file: Express.Multer.File): Promise<string> => {
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'civicfix-ai',
        resource_type: 'image'
      });
      // Optionally remove local temp file after upload
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        // ignore
      }
      return result.secure_url;
    } catch (err: any) {
      logger.warn('Cloudinary upload failed, using local URL:', err.message);
    }
  }

  // Local URL served by express.static
  return `${config.serverUrl}/uploads/${file.filename}`;
};
