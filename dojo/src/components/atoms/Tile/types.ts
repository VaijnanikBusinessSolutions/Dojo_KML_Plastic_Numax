import type { LucideIcon } from 'lucide-react';

export interface LinkType {
  name: string;
  path: string;
  icon?: LucideIcon;
}

export interface TileProps {
  title: string;
  links: LinkType[];
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  borderTopColor?: string;
  disabled?: boolean;
}
