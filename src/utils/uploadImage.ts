import { Request } from "express";
import multer from "multer";

const filename = (
  _req: Request,
  file: Express.Multer.File,
  next: (a: any, b: any) => void
) => {
  const lastndexOf = file.originalname.lastIndexOf(".");
  const ext = file.originalname.substring(lastndexOf);
  next(null, `img-${Date.now()}${ext}`);
};

const destination = (
  _req: Request,
  _file: Express.Multer.File,
  next: (a: any, b: any) => void
) => {
  next(null, `${__dirname}/../../uploads`);
};

const upload = multer({
  storage: multer.diskStorage({ destination, filename }),
});

export default upload;
