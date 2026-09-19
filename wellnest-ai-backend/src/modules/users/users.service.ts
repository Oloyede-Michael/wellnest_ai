import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserPreference } from '../database/entities/user-preference.entity';
import { Vital } from '../database/entities/vital.entity';
import { MedicationsService } from '../medications/medications.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { daysBetween, monthYearLabel } from '../../utils/date.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserPreference) private readonly preferenceRepository: Repository<UserPreference>,
    @InjectRepository(Vital) private readonly vitalRepository: Repository<Vital>,
    private readonly medicationsService: MedicationsService,
  ) {}

  async getDashboardProfile(userId: string) {
    const user = await this.findUserOrThrow(userId);
    const { adherence, trend } = await this.medicationsService.getAdherenceSummary(userId);

    return {
      id: user.id,
      name: user.name,
      role: user.role === 'patient' ? 'Patient' : 'Caregiver',
      plan: user.plan,
      initials: this.initialsFor(user.name),
      memberSince: monthYearLabel(user.created_at),
      diagnosis: user.diagnosis ?? null,
      stage: user.stage ?? null,
      nextAppointment:
        user.next_appointment_date || user.next_appointment_time || user.next_appointment_with
          ? {
              date: user.next_appointment_date ?? null,
              time: user.next_appointment_time ?? null,
              withWhom: user.next_appointment_with ?? null,
            }
          : null,
      adherence,
      adherenceTrend: trend,
      daysActive: Math.max(0, daysBetween(user.created_at, new Date())),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findUserOrThrow(userId);
    if (dto.diagnosis !== undefined) user.diagnosis = dto.diagnosis;
    if (dto.stage !== undefined) user.stage = dto.stage;
    if (dto.nextAppointmentDate !== undefined) user.next_appointment_date = dto.nextAppointmentDate;
    if (dto.nextAppointmentTime !== undefined) user.next_appointment_time = dto.nextAppointmentTime;
    if (dto.nextAppointmentWith !== undefined) user.next_appointment_with = dto.nextAppointmentWith;
    await this.userRepository.save(user);
    return this.getDashboardProfile(userId);
  }

  async getVitals(userId: string) {
    const vitals = await this.vitalRepository.find({ where: { user_id: userId }, order: { recorded_at: 'DESC' } });
    return vitals.map((v) => ({
      label: v.label,
      value: v.value,
      unit: v.unit,
      status: v.status,
      note: v.note ?? null,
    }));
  }

  async getPreferences(userId: string) {
    const preference = await this.findOrCreatePreferences(userId);
    return {
      medicationReminders: preference.medication_reminders,
      caregiverNotifications: preference.caregiver_notifications,
      biometricLock: preference.biometric_lock,
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const preference = await this.findOrCreatePreferences(userId);
    if (dto.medicationReminders !== undefined) preference.medication_reminders = dto.medicationReminders;
    if (dto.caregiverNotifications !== undefined) preference.caregiver_notifications = dto.caregiverNotifications;
    if (dto.biometricLock !== undefined) preference.biometric_lock = dto.biometricLock;
    await this.preferenceRepository.save(preference);
    return this.getPreferences(userId);
  }

  private async findOrCreatePreferences(userId: string): Promise<UserPreference> {
    const existing = await this.preferenceRepository.findOne({ where: { user_id: userId } });
    if (existing) return existing;
    return this.preferenceRepository.save(
      this.preferenceRepository.create({
        user_id: userId,
        medication_reminders: true,
        caregiver_notifications: true,
        biometric_lock: false,
      }),
    );
  }

  private async findUserOrThrow(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
    return initials.join('') || '?';
  }
}
