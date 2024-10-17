import { User } from '../types';
import bcrypt from 'bcryptjs';

const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

export const users: User[] = [
  {
    username: 'admin',
    password: hashPassword('dgpc2024'),
    role: 'admin'
  },
  {
    username: 'adrar',
    password: hashPassword('adrar2024'),
    role: 'user',
    wilayaId: '01'
  }
  // Add more users here as needed
];