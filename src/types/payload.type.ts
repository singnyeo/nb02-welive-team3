import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../entities/user.entity';

export type Payload = JwtPayload & {
  id: string;
  role: UserRole;
};
