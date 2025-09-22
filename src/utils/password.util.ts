import bcrypt from 'bcrypt';

const SALT_OR_ROUND = 10;

// 비밀번호 암호화
export const hashPassword = async (password: string): Promise<string> => await bcrypt.hash(password, SALT_OR_ROUND);

// 비밀번호 비교
export const comparePassword = async (raw: string, hashed: string): Promise<Boolean> =>
  await bcrypt.compare(raw, hashed);
