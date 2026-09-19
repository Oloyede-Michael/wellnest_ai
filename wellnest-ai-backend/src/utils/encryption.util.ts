import jwt, { SignOptions } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { config } from '../config/environment';

export const generateToken = (payload: { sub: string; role: string }): string => {
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as NonNullable<SignOptions['expiresIn']> };
  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, config.jwtSecret);
};

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, 12);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
