import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ApprovalStatus } from '../entities/approvalStatus.entity';

export async function seedUsers(dataSource: DataSource) {
  const repo = dataSource.getRepository(User);

  // SuperAdmin 계정 확인
  const exists = await repo.findOne({ where: { username: 'superadmin' } });
  if (!exists) {
    const hashedPassword = await bcrypt.hash('superadmin1234!', 10);
    const superAdmin = repo.create({
      username: 'superadmin',
      password: hashedPassword,
      name: '홍길동',
      email: 'superadmin@example.com',
      contact: '010-0000-0000',
      role: UserRole.SUPER_ADMIN,
      joinStatus: ApprovalStatus.APPROVED,
      isActive: true,
    });
    await repo.save(superAdmin);
    console.log('SuperAdmin seeded');
  } else {
    console.log('SuperAdmin already exists');
  }
}
