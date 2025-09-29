import { Multer } from 'multer';
import { Payload } from './payload.type';

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
      user?: Payload;
    }
  }
}
