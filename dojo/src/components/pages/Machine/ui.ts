// Tailwind helper class generators for consistent badges
export const levelBadge = (level: number) => {
  switch (level) {
    case 1:
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 2:
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
    case 3:
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
    case 4:
    default:
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  }
};

export const statusBadge = (status: 'pending' | 'approved') =>
  status === 'approved'
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';