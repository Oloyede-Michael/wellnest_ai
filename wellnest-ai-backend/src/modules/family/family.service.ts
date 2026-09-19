import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaregiverLink } from '../database/entities/caregiver-link.entity';
import { InviteCaregiverDto } from './dto/invite-caregiver.dto';
import { generateCaregiverLinkId } from '../../utils/id.util';

const ACCESS_LABEL: Record<string, string> = {
  full: 'Full access',
  appointments: 'Appointments only',
  medications: 'Medications only',
};

@Injectable()
export class FamilyService {
  constructor(@InjectRepository(CaregiverLink) private readonly linkRepository: Repository<CaregiverLink>) {}

  async list(patientId: string) {
    const links = await this.linkRepository.find({ where: { patient_id: patientId }, order: { invited_at: 'DESC' } });
    return links.map((link) => this.toDto(link));
  }

  async invite(patientId: string, dto: InviteCaregiverDto) {
    const name = dto.name ?? dto.email.split('@')[0]!;
    const link = await this.linkRepository.save(
      this.linkRepository.create({
        id: generateCaregiverLinkId(),
        patient_id: patientId,
        email: dto.email,
        name,
        relation: dto.relation ?? 'Invited · Pending',
        access_level: dto.accessLevel ?? 'full',
        status: 'pending',
        last_activity_note: 'Invitation sent just now',
      }),
    );
    return this.toDto(link);
  }

  async updateAccess(patientId: string, id: string, accessLevel: 'full' | 'appointments' | 'medications') {
    const link = await this.findOrThrow(patientId, id);
    link.access_level = accessLevel;
    await this.linkRepository.save(link);
    return this.toDto(link);
  }

  async revoke(patientId: string, id: string) {
    const link = await this.findOrThrow(patientId, id);
    await this.linkRepository.remove(link);
    return { id };
  }

  private async findOrThrow(patientId: string, id: string): Promise<CaregiverLink> {
    const link = await this.linkRepository.findOne({ where: { id, patient_id: patientId } });
    if (!link) throw new NotFoundException('Caregiver link not found');
    return link;
  }

  private toDto(link: CaregiverLink) {
    return {
      id: link.id,
      name: link.name,
      relation: link.relation,
      access: ACCESS_LABEL[link.access_level] ?? link.access_level,
      accessLevel: link.access_level,
      status: link.status,
      lastSeen: link.last_activity_note ?? null,
      initials: link.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join(''),
    };
  }
}
