export const colors = {
  coral: '#B80F0A',
  coralDark: '#920C08',
  mint: '#7ADBC8',
  lavender: '#D7C8FF',
  cream: '#FFF7EF',
  navy: '#252B5C',
  softGray: '#F5F3F0',
  softBorder: '#ECE8E2',
  card: '#FFFFFF',
  success: '#4DBB9A',
  warning: '#FFB84D',
  danger: '#D92D20',
  white: '#FFFFFF',
  text: '#252B5C',
  mutedText: '#8386A8',
} as const;

export type AppColor = keyof typeof colors;
