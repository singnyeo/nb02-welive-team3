import { Router } from "express";
import { CreateNotice, ListNotice, NoticeDetail, UpdateNotice, DeleteNotice } from "./notice.controller";
import { allow, AllowedRole } from "../middlewares/allow.middleware";

const notice = Router();

notice.post('/', allow(AllowedRole.ADMIN), CreateNotice);
notice.get('/', allow(AllowedRole.USER), ListNotice);
notice.get('/:noticeId', allow(AllowedRole.USER), NoticeDetail);
notice.patch('/:noticeId', allow(AllowedRole.ADMIN), UpdateNotice);
notice.delete('/:noticeId', allow(AllowedRole.ADMIN), DeleteNotice);

export default notice;
