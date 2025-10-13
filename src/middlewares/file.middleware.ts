import { Request, Response, NextFunction } from 'express';
import { upload } from '../utils/file.util';

export const singleFileUpload = (fieldName: string) => {
  const middleware = upload.single(fieldName);
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};
