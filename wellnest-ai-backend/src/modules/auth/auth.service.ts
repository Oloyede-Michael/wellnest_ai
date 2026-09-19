import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserPreference } from '../database/entities/user-preference.entity';
import { EmergencyProfile } from '../database/entities/emergency-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { comparePassword, generateToken, hashPassword } from '../../utils/encryption.util';
import { generateUserId } from '../../utils/id.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserPreference) private readonly preferenceRepository: Repository<UserPreference>,
    @InjectRepository(EmergencyProfile) private readonly emergencyRepository: Repository<EmergencyProfile>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = this.userRepository.create({
      id: generateUserId(),
      email: dto.email,
      password_hash: await hashPassword(dto.password),
      name: dto.name,
      role: dto.role,
      plan: 'Free',
    });
    await this.userRepository.save(user);

    await this.preferenceRepository.save(
      this.preferenceRepository.create({
        user_id: user.id,
        medication_reminders: true,
        caregiver_notifications: true,
        biometric_lock: false,
      }),
    );

    if (dto.role === 'patient') {
      await this.emergencyRepository.save(
        this.emergencyRepository.create({
          user_id: user.id,
          allergies: [],
          conditions: [],
          medications_summary: [],
        }),
      );
    }

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !(await comparePassword(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const accessToken = generateToken({ sub: user.id, role: user.role });
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
