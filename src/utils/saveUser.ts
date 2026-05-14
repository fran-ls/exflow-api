import { envs } from "../config/envs";
import { UserRepository } from "../repositories/user.repository"
import { HashUtil } from "./hash";

export const saveUser = async () => {
  const repo = new UserRepository();
  const user = envs.USER;

  const exists = await repo.findOne({ email: user?.email });

  if (exists) return {
    success: true,
    message: 'User retrieved',
    data: {
      id: exists.id,
      username: exists.username,
      email: exists.email,
    }
  }

  if (!user) return {
    success: false,
    message: 'User not found',
    data: null
  }

  const hash = await HashUtil.hash(user.password);

  const data = await repo.create({
    ...user,
    password: hash,
    role: 'USER',
  });

  console.log('✅ User saved...');

  return {
    success: true,
    message: 'User saved',
    data: {
      id: data.id,
      username: data.username,
      email: data.email,
    }
  }
}