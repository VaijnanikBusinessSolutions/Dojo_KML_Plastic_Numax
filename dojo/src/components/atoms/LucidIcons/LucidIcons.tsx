import type { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;   // lowercase prop
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 20,
  className = '',
  onClick,
}) => {
  return (
    <IconComponent
      size={size}
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    />
  );
};
