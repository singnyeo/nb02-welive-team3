import { UserRole } from '../entities/user.entity';

export type Payload = {
  id: string;
  role: UserRole;
};
