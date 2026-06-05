// src/components/pages/Report/types.ts
export type ReportAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};