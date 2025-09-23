import { Router } from "express";
import * as ResidentController from "./resident.controller";
import { allow, AllowedRole } from '../middlewares/allow.middleware';

const router = Router();

router.post("/", allow(AllowedRole.ADMIN), ResidentController.createResident);
router.post("/from-user/:userId", allow(AllowedRole.ADMIN), ResidentController.createResidentFromUser);

export default router;