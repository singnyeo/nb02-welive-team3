<<<<<<< HEAD
import { UserRole } from '../entities/user.entity';

export type Payload = {
=======
import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../entities/user.entity';

export type Payload = JwtPayload & {
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
  id: string;
  role: UserRole;
};
