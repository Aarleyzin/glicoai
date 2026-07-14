export type ReadingStatus = 'Dentro do alvo' | 'Alta' | 'Baixa' | 'Atenção';

export type MockReading = {
  id: string;
  value: number;
  context: string;
  note: string;
  timeLabel: string;
  dateLabel: string;
  status: ReadingStatus;
};

export const mockReadings: MockReading[] = [
  {
    id: 'reading-1',
    value: 112,
    context: 'Agora',
    note: 'Antes do café da manhã',
    timeLabel: '08:10',
    dateLabel: 'Hoje',
    status: 'Dentro do alvo',
  },
  {
    id: 'reading-2',
    value: 128,
    context: 'Após refeição',
    note: 'Almoço leve',
    timeLabel: '12:45',
    dateLabel: 'Ontem',
    status: 'Dentro do alvo',
  },
  {
    id: 'reading-3',
    value: 184,
    context: 'Antes de dormir',
    note: 'Dia mais corrido',
    timeLabel: '22:18',
    dateLabel: 'Ontem',
    status: 'Alta',
  },
  {
    id: 'reading-4',
    value: 94,
    context: 'Jejum',
    note: 'No alvo ao acordar',
    timeLabel: '07:12',
    dateLabel: 'Seg',
    status: 'Dentro do alvo',
  },
];

export const quickInsights = [
  'Sua rotina da manhã está mais consistente nesta semana.',
  'As medições após refeição parecem subir um pouco mais do que nos outros períodos.',
  'Seu ritmo de registro está bom e ajuda a perceber padrões com mais calma.',
];

export const moreMenuItems = [
  { href: '/assistant', title: 'Assistente IA', description: 'Entenda seus registros com mais clareza.' },
  { href: '/reports', title: 'Relatórios', description: 'Gere um resumo claro das suas medições.' },
  { href: '/reminders', title: 'Lembretes', description: 'Organize horários para registrar sua glicose.' },
  { href: '/settings', title: 'Configurações', description: 'Ajuste perfil, unidade e faixa alvo.' },
  { href: '/premium', title: 'Premium', description: 'Desbloqueie recursos extras do GlicoAí.' },
  { href: '/privacy', title: 'Política de Privacidade', description: 'Entenda como seus dados são tratados.' },
  { href: '/terms', title: 'Termos de Uso', description: 'Consulte as regras de uso do app.' },
];

export const periodFilters = ['Hoje', '7 dias', '30 dias', '90 dias'] as const;
