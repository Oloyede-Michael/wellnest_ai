import { Injectable } from '@nestjs/common';

export interface AssistantContext {
  diagnosis?: string | undefined;
  stage?: string | undefined;
  medicationNames: string[];
}

/**
 * PRD feature "WellNest AI Assistant" (P0-4). Mocked contextual reply engine —
 * keyword-matches the question and blends in the patient's own diagnosis /
 * medication list so answers read as personalized, without calling an LLM.
 */
@Injectable()
export class AiAssistantMockService {
  reply(question: string, context: AssistantContext): string {
    const q = question.trim().toLowerCase();
    const primaryMed = context.medicationNames[0] ?? 'your medication';
    const diagnosis = context.diagnosis ?? 'your condition';

    if (/miss(ed)? a dose|forgot|forget/.test(q)) {
      return `Missing a single dose of ${primaryMed} occasionally isn't dangerous, but consistency matters for managing ${diagnosis.toLowerCase()}. If you remember within a few hours, take it — but skip it entirely if it's close to your next scheduled dose, rather than doubling up.`;
    }

    if (/after eating|with food|empty stomach/.test(q)) {
      return `Yes — ${primaryMed} can generally be taken with or without food. Some people prefer taking it after a meal if it causes mild light-headedness on an empty stomach. Always follow the specific instruction on your prescription.`;
    }

    if (/food|avoid|diet|eat/.test(q)) {
      return `With ${primaryMed}, it's worth watching your potassium intake — bananas, potatoes, and salt substitutes in large amounts can raise potassium too high alongside this medication. High-sodium foods also work against your treatment goals.`;
    }

    if (/how long|improve|better|progress/.test(q)) {
      return `Most people managing ${diagnosis.toLowerCase()} see real improvement within 2 to 4 weeks of consistent medication and lifestyle changes. Keep tracking your vitals in WellNest so you and your care team can see the trend.`;
    }

    if (/what (does|is) my diagnosis|what does .* mean/.test(q)) {
      return `${diagnosis} means your care team has identified something that needs ongoing monitoring and treatment. Check the Diagnosis summary on your dashboard for the plain-language explanation, and always confirm specifics with your doctor.`;
    }

    return `Based on your records and current treatment plan for ${diagnosis.toLowerCase()}, that's worth confirming with your care provider directly. In general, staying consistent with your medication timing matters more than the exact minute you take it.`;
  }

  quickPrompts(context: AssistantContext): string[] {
    const primaryMed = context.medicationNames[0];
    return [
      'What happens if I miss a dose?',
      primaryMed ? `Can I take ${primaryMed} after eating?` : 'Can I take this medicine after eating?',
      'What foods should I avoid?',
      'How long until I see improvement?',
    ];
  }
}
