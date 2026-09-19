import { randomUUID } from 'crypto';

function withPrefix(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

export const generateUserId = () => withPrefix('user');
export const generateDocumentId = () => withPrefix('doc');
export const generateMedicationBlockId = () => withPrefix('medblock');
export const generateMedicationItemId = () => withPrefix('meditem');
export const generateEventId = () => withPrefix('event');
export const generateCaregiverLinkId = () => withPrefix('family');
export const generateChatMessageId = () => withPrefix('msg');
export const generateEmergencyContactId = () => withPrefix('contact');
export const generateVitalId = () => withPrefix('vital');
