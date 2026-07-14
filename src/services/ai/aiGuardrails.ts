import type { AssistantSafetyReview } from './assistant-types';

const blockedPatterns = [
  {
    reason: 'insulin' as const,
    riskLevel: 'high' as const,
    patterns: [/insulina/i, /dose/i, /quantas unidades/i, /ajustar dose/i, /corrigir com insulina/i],
    response:
      'Eu não posso sugerir dose de insulina nem ajustar medicação. Posso te ajudar a resumir tendências dos seus registros para você conversar com um profissional de saúde.',
  },
  {
    reason: 'medication' as const,
    riskLevel: 'high' as const,
    patterns: [/medica[cç][aã]o/i, /rem[eé]dio/i, /metformina/i, /tomar mais/i, /parar o rem[eé]dio/i],
    response:
      'Eu não posso orientar mudanças de medicação. O que eu consigo fazer com segurança é destacar padrões dos seus registros para apoiar uma conversa com seu profissional de saúde.',
  },
  {
    reason: 'diagnosis' as const,
    riskLevel: 'high' as const,
    patterns: [/diagn[oó]stic/i, /eu tenho diabetes/i, /estou com diabetes/i, /isso significa diabetes/i],
    response:
      'Eu não posso diagnosticar nem dizer se você tem ou não tem diabetes. Posso apontar tendências dos seus registros e sugerir perguntas úteis para levar ao médico.',
  },
  {
    reason: 'treatment' as const,
    riskLevel: 'high' as const,
    patterns: [/tratamento/i, /o que devo fazer/i, /como tratar/i, /conduta/i, /qual a melhor conduta/i],
    response:
      'Eu não substituo orientação médica nem defino tratamento. Posso ajudar a organizar seus dados e mostrar o que vale acompanhar com mais atenção.',
  },
  {
    reason: 'cure' as const,
    riskLevel: 'high' as const,
    patterns: [/cura/i, /curar/i, /reverter/i, /sumiu de vez/i],
    response:
      'Eu não posso prometer cura nem interpretar isso como confirmação clínica. Posso resumir seus registros e sugerir como levar essas observações para consulta.',
  },
];

function mentionsClinicalUrgency(question: string) {
  return /tonto|desmaio|desmaiei|sintomas|passando mal|muito alta|muito baixa|hipoglic|hiperglic|vomitei|suando frio|vis[aã]o emba/i.test(
    question
  );
}

export function reviewAssistantPrompt(question: string): AssistantSafetyReview {
  const normalizedQuestion = question.trim();

  if (mentionsClinicalUrgency(normalizedQuestion)) {
    return {
      blocked: true,
      riskLevel: 'high',
      reason: 'urgency',
      response:
        'Se você está com sintomas, mal-estar ou suspeita de valores muito altos ou muito baixos, procure orientação profissional ou atendimento imediatamente. Eu posso ajudar apenas a organizar os registros para a conversa clínica.',
    };
  }

  for (const blockedPattern of blockedPatterns) {
    if (blockedPattern.patterns.some((pattern) => pattern.test(normalizedQuestion))) {
      return {
        blocked: true,
        riskLevel: blockedPattern.riskLevel,
        reason: blockedPattern.reason,
        response: `${blockedPattern.response} Se houver sintomas, valores muito altos ou muito baixos, procure atendimento profissional.`,
      };
    }
  }

  return {
    blocked: false,
    riskLevel: 'low',
    reason: 'safe',
    response: null,
  };
}

export function finalizeSafeAssistantResponse(
  response: string,
  options?: {
    includeUrgencyNote?: boolean;
  }
) {
  const safeSuffix = options?.includeUrgencyNote
    ? ' Isso mostra apenas tendências dos seus registros. Se houver sintomas, valores muito altos ou muito baixos, procure orientação profissional.'
    : ' Isso mostra apenas tendências dos seus registros e não substitui orientação médica.';

  if (
    response.includes('não substitui orientação médica') ||
    response.includes('nao substitui orientacao medica') ||
    response.includes('tendências dos seus registros') ||
    response.includes('tendencias dos seus registros')
  ) {
    return response;
  }

  return `${response}${safeSuffix}`;
}

export function buildFutureOpenAIIntegrationNote() {
  return {
    provider: 'local-analysis',
    nextStep:
      'As respostas usam seus registros para mostrar tendências com privacidade, segurança e clareza. O GlicoAí não substitui orientação médica.',
  };
}
