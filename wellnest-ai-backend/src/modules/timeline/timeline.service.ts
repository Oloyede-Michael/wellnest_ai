import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthEvent } from '../database/entities/health-event.entity';
import { fullDateLabel } from '../../utils/date.util';

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

@Injectable()
export class TimelineService {
  constructor(@InjectRepository(HealthEvent) private readonly eventRepository: Repository<HealthEvent>) {}

  async getTimeline(userId: string) {
    const events = await this.eventRepository.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
    return events.map((e) => ({
      id: e.id,
      date: fullDateLabel(e.created_at),
      kind: e.kind,
      title: e.title,
      detail: e.detail ?? null,
    }));
  }

  async getRecentActivity(userId: string, limit = 4) {
    const events = await this.eventRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      detail: e.detail ?? null,
      kind: e.kind,
      time: relativeTime(e.created_at),
    }));
  }
}
