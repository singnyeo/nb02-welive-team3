import { Router } from "express";
import * as ResidentController from "./resident.controller";
import { allow, AllowedRole } from '../middlewares/allow.middleware';
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/", allow(AllowedRole.ADMIN), ResidentController.createResident);
router.post("/from-user/:userId", allow(AllowedRole.ADMIN), ResidentController.createResidentFromUser);
router.get(
  "/file/template",
  allow(AllowedRole.ADMIN),
  ResidentController.downloadResidentTemplate
);
router.post(
  '/from-file',
  allow(AllowedRole.ADMIN),
  upload.single('file'),
  ResidentController.uploadResidentsFromFile
);

export default router;