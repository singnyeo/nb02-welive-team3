import { RequestHandler } from 'express';
import { UserMeRequestSchema } from './users.dto';
import { BadRequestError } from '../types/error.type';
import { updateMe } from './users.service';
import { getUser } from '../utils/user.util';

export const handleUpdateMe: RequestHandler = async (req, res) => {
  console.log(req.file);
  const result = UserMeRequestSchema.safeParse({
    body: req.body,
  });
  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다');
  }
  const user = getUser(req);
  const { id } = user;
  const { currentPassword, newPassword } = result.data.body ?? {};
  const file = req.file ?? undefined;

  const updated = await updateMe(id, currentPassword, newPassword, file);

  res.status(200).json({
    message: `${updated.name}의 정보가 성공적으로 업데이트되었습니다. 다시 로그인해주세요.`,
  });
};
