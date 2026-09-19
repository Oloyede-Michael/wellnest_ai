import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyProfile } from '../database/entities/emergency-profile.entity';
import { EmergencyContact } from '../database/entities/emergency-contact.entity';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { generateEmergencyContactId } from '../../utils/id.util';

@Injectable()
export class EmergencyService {
  constructor(
    @InjectRepository(EmergencyProfile) private readonly profileRepository: Repository<EmergencyProfile>,
    @InjectRepository(EmergencyContact) private readonly contactRepository: Repository<EmergencyContact>,
  ) {}

  async getWallet(userId: string) {
    const profile = await this.findOrCreateProfile(userId);
    const contacts = await this.contactRepository.find({ where: { user_id: userId } });
    return {
      bloodGroup: profile.blood_group ?? null,
      allergies: profile.allergies,
      conditions: profile.conditions,
      medications: profile.medications_summary,
      contacts: contacts.map((c) => ({ id: c.id, name: c.name, relation: c.relation, phone: c.phone })),
    };
  }

  async updateWallet(userId: string, dto: UpdateEmergencyDto) {
    const profile = await this.findOrCreateProfile(userId);
    if (dto.bloodGroup !== undefined) profile.blood_group = dto.bloodGroup;
    if (dto.allergies !== undefined) profile.allergies = dto.allergies;
    if (dto.conditions !== undefined) profile.conditions = dto.conditions;
    if (dto.medicationsSummary !== undefined) profile.medications_summary = dto.medicationsSummary;
    await this.profileRepository.save(profile);
    return this.getWallet(userId);
  }

  async addContact(userId: string, dto: CreateContactDto) {
    const contact = await this.contactRepository.save(
      this.contactRepository.create({
        id: generateEmergencyContactId(),
        user_id: userId,
        name: dto.name,
        relation: dto.relation,
        phone: dto.phone,
      }),
    );
    return { id: contact.id, name: contact.name, relation: contact.relation, phone: contact.phone };
  }

  async updateContact(userId: string, id: string, dto: UpdateContactDto) {
    const contact = await this.contactRepository.findOne({ where: { id, user_id: userId } });
    if (!contact) throw new NotFoundException('Emergency contact not found');
    if (dto.name !== undefined) contact.name = dto.name;
    if (dto.relation !== undefined) contact.relation = dto.relation;
    if (dto.phone !== undefined) contact.phone = dto.phone;
    await this.contactRepository.save(contact);
    return { id: contact.id, name: contact.name, relation: contact.relation, phone: contact.phone };
  }

  async removeContact(userId: string, id: string) {
    const contact = await this.contactRepository.findOne({ where: { id, user_id: userId } });
    if (!contact) throw new NotFoundException('Emergency contact not found');
    await this.contactRepository.remove(contact);
    return { id };
  }

  private async findOrCreateProfile(userId: string): Promise<EmergencyProfile> {
    const existing = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (existing) return existing;
    return this.profileRepository.save(
      this.profileRepository.create({ user_id: userId, allergies: [], conditions: [], medications_summary: [] }),
    );
  }
}
