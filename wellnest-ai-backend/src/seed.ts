import { AppDataSource } from './data-source';
import { User } from './modules/database/entities/user.entity';
import { UserPreference } from './modules/database/entities/user-preference.entity';
import { Vital } from './modules/database/entities/vital.entity';
import { MedicalDocument } from './modules/database/entities/medical-document.entity';
import { MedicationBlock } from './modules/database/entities/medication-block.entity';
import { MedicationItem } from './modules/database/entities/medication-item.entity';
import { MedicationDoseLog } from './modules/database/entities/medication-dose-log.entity';
import { HealthEvent } from './modules/database/entities/health-event.entity';
import { CaregiverLink } from './modules/database/entities/caregiver-link.entity';
import { EmergencyProfile } from './modules/database/entities/emergency-profile.entity';
import { EmergencyContact } from './modules/database/entities/emergency-contact.entity';
import { ChatMessage } from './modules/database/entities/chat-message.entity';
import { hashPassword } from './utils/encryption.util';
import { generateUserId, generateEventId, generateEmergencyContactId, generateChatMessageId } from './utils/id.util';
import { toDateOnly } from './utils/date.util';

const DEMO_EMAIL = 'sarah@wellnest.ai';
const DEMO_PASSWORD = 'WellNest123!';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log(`Demo user already exists (${DEMO_EMAIL}); skipping seed. Delete the row to re-seed.`);
    await AppDataSource.destroy();
    return;
  }

  const user = await userRepo.save(
    userRepo.create({
      id: generateUserId(),
      email: DEMO_EMAIL,
      password_hash: await hashPassword(DEMO_PASSWORD),
      name: 'Sarah Johnson',
      role: 'patient',
      plan: 'Premium',
      diagnosis: 'Hypertension',
      stage: 'Stage 1',
      next_appointment_date: 'Jun 22',
      next_appointment_time: '9:00 AM',
      next_appointment_with: 'Dr. Patel · Cardiology',
    }),
  );
  const userId = user.id;

  await AppDataSource.getRepository(UserPreference).save({
    user_id: userId,
    medication_reminders: true,
    caregiver_notifications: true,
    biometric_lock: false,
  });

  const vitalRepo = AppDataSource.getRepository(Vital);
  await vitalRepo.save([
    vitalRepo.create({
      id: `${userId}-vital-bp`,
      user_id: userId,
      label: 'Blood pressure',
      value: '128/82',
      unit: 'mmHg',
      status: 'improving',
      note: 'down from 148/94',
    }),
    vitalRepo.create({
      id: `${userId}-vital-hr`,
      user_id: userId,
      label: 'Resting heart rate',
      value: '71',
      unit: 'bpm',
      status: 'steady',
      note: 'within normal range',
    }),
    vitalRepo.create({
      id: `${userId}-vital-weight`,
      user_id: userId,
      label: 'Weight',
      value: '78.4',
      unit: 'kg',
      status: 'steady',
      note: 'unchanged this month',
    }),
  ]);

  const blockRepo = AppDataSource.getRepository(MedicationBlock);
  const itemRepo = AppDataSource.getRepository(MedicationItem);

  const morning = await blockRepo.save(
    blockRepo.create({ id: `${userId}-block-morning`, user_id: userId, time_of_day: 'Morning', clock: '8:00 AM', active: true }),
  );
  const afternoon = await blockRepo.save(
    blockRepo.create({ id: `${userId}-block-afternoon`, user_id: userId, time_of_day: 'Afternoon', clock: '1:00 PM', active: true }),
  );
  const night = await blockRepo.save(
    blockRepo.create({ id: `${userId}-block-night`, user_id: userId, time_of_day: 'Night', clock: '9:00 PM', active: false }),
  );

  const items = await itemRepo.save([
    itemRepo.create({
      id: `${userId}-item-lisinopril`,
      block_id: morning.id,
      user_id: userId,
      name: 'Lisinopril',
      dose: '10mg',
      purpose: 'For blood pressure',
      instruction: 'Take with water, before breakfast',
    }),
    itemRepo.create({
      id: `${userId}-item-aspirin`,
      block_id: morning.id,
      user_id: userId,
      name: 'Aspirin',
      dose: '81mg',
      purpose: 'Blood thinner',
      instruction: 'Take with food',
    }),
    itemRepo.create({
      id: `${userId}-item-amlodipine`,
      block_id: afternoon.id,
      user_id: userId,
      name: 'Amlodipine',
      dose: '5mg',
      purpose: 'For blood pressure',
      instruction: 'Take after lunch',
    }),
    itemRepo.create({
      id: `${userId}-item-atorvastatin`,
      block_id: night.id,
      user_id: userId,
      name: 'Atorvastatin',
      dose: '20mg',
      purpose: 'Cholesterol control',
      instruction: 'Take before bed',
    }),
    itemRepo.create({
      id: `${userId}-item-metformin`,
      block_id: night.id,
      user_id: userId,
      name: 'Metformin',
      dose: '500mg',
      purpose: 'Blood sugar support',
      instruction: 'Take with dinner',
    }),
  ]);

  // Last 7 days of dose logs, shaped like the frontend mock's weekly adherence chart
  // (mostly-taken week with one partial day and one missed day).
  const doseLogRepo = AppDataSource.getRepository(MedicationDoseLog);
  const takenFractionByDaysAgo: Record<number, number> = { 6: 1, 5: 1, 4: 0.4, 3: 1, 2: 1, 1: 0, 0: 1 };
  const doseLogs: MedicationDoseLog[] = [];
  for (const [daysAgoStr, fraction] of Object.entries(takenFractionByDaysAgo)) {
    const daysAgo = Number(daysAgoStr);
    const forDate = toDateOnly(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));
    const takenCount = Math.round(items.length * fraction);
    items.forEach((item, index) => {
      doseLogs.push(
        doseLogRepo.create({
          id: `${item.id}_${forDate}`,
          item_id: item.id,
          user_id: userId,
          for_date: forDate,
          taken: index < takenCount,
          taken_at: index < takenCount ? new Date() : undefined,
        }),
      );
    });
  }
  await doseLogRepo.save(doseLogs);

  const documentRepo = AppDataSource.getRepository(MedicalDocument);
  await documentRepo.save([
    documentRepo.create({
      id: `${userId}-doc-1`,
      user_id: userId,
      name: 'Prescription — Dr. Patel',
      type: 'Prescription',
      status: 'Analyzed',
      pages: 1,
      extracted_diagnosis: 'Hypertension',
      extracted_summary: 'Lisinopril 10mg and Aspirin 81mg prescribed for blood pressure management.',
    }),
    documentRepo.create({
      id: `${userId}-doc-2`,
      user_id: userId,
      name: 'Blood Work — May 2025',
      type: 'Lab result',
      status: 'Analyzed',
      pages: 3,
      extracted_summary: 'Comprehensive metabolic panel — hypertension confirmed, Stage 1.',
    }),
    documentRepo.create({
      id: `${userId}-doc-3`,
      user_id: userId,
      name: 'Cardiology Discharge Summary',
      type: 'Discharge summary',
      status: 'Analyzed',
      pages: 2,
      extracted_summary: 'Cardiology follow-up completed. Continue current medications.',
    }),
  ]);

  const eventRepo = AppDataSource.getRepository(HealthEvent);
  const timelineSeed: Array<[HealthEvent['kind'], string, string]> = [
    ['diagnosis', 'Diagnosis confirmed', 'Hypertension, Stage 1 — treatment plan started'],
    ['appointment', 'Appointment completed', 'Cardiology follow-up · Dr. Patel · 45 min'],
    ['medication', 'Medication plan updated', 'Amlodipine 5mg added by Dr. Patel'],
    ['document', 'Lab result uploaded', 'Comprehensive metabolic panel — all reviewed'],
    ['document', 'Lab results uploaded', 'Blood work analysis — hypertension confirmed, Stage 1'],
  ];
  for (const [kind, title, detail] of timelineSeed) {
    await eventRepo.save(eventRepo.create({ id: generateEventId(), user_id: userId, kind, title, detail }));
  }

  const caregiverRepo = AppDataSource.getRepository(CaregiverLink);
  await caregiverRepo.save([
    caregiverRepo.create({
      id: `${userId}-family-1`,
      patient_id: userId,
      email: 'tolu@example.com',
      name: 'Tolu Johnson',
      relation: 'Daughter · Caregiver',
      access_level: 'full',
      status: 'active',
      last_activity_note: 'Checked medication plan · 3h ago',
    }),
    caregiverRepo.create({
      id: `${userId}-family-2`,
      patient_id: userId,
      email: 'michael@example.com',
      name: 'Michael Johnson',
      relation: 'Son',
      access_level: 'appointments',
      status: 'active',
      last_activity_note: 'Viewed next appointment · 2d ago',
    }),
  ]);

  await AppDataSource.getRepository(EmergencyProfile).save({
    user_id: userId,
    blood_group: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    conditions: ['Hypertension, Stage 1', 'Seasonal asthma'],
    medications_summary: ['Lisinopril 10mg', 'Aspirin 81mg', 'Amlodipine 5mg'],
  });

  const contactRepo = AppDataSource.getRepository(EmergencyContact);
  await contactRepo.save([
    contactRepo.create({
      id: generateEmergencyContactId(),
      user_id: userId,
      name: 'Tolu Johnson',
      relation: 'Daughter',
      phone: '+1 416 555 0148',
    }),
    contactRepo.create({
      id: generateEmergencyContactId(),
      user_id: userId,
      name: 'Dr. Patel',
      relation: 'Cardiologist',
      phone: '+1 416 555 0117',
    }),
  ]);

  const chatRepo = AppDataSource.getRepository(ChatMessage);
  await chatRepo.save([
    chatRepo.create({
      id: generateChatMessageId(),
      user_id: userId,
      role: 'assistant',
      text: "Hi Sarah, I'm WellNest AI. I have full context of your health records — your latest labs, your medication plan, and Dr. Patel's notes. What would you like to understand today?",
    }),
    chatRepo.create({
      id: generateChatMessageId(),
      user_id: userId,
      role: 'user',
      text: 'What does hypertension mean exactly?',
    }),
    chatRepo.create({
      id: generateChatMessageId(),
      user_id: userId,
      role: 'assistant',
      text: 'Hypertension means your blood pressure is consistently higher than it should be. Your latest reading was 128/82 mmHg, a lot closer to the healthy target of 120/80 than where you started. You are Stage 1, which responds well to the medication and habits you are already building.',
    }),
  ]);

  console.log('Seed complete.');
  console.log(`Demo login — email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`);
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
