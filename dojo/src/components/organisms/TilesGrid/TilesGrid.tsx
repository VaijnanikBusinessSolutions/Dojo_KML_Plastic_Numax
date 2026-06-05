import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Tile from '../../atoms/Tile';
import type { LinkType } from '../../atoms/Tile/types';

export interface TilesGridProps {
  tiles: Array<{
    title: string;
    links: LinkType[];
    icon: LucideIcon;
    iconBgColor?: string;
    iconColor?: string;
    borderTopColor?: string;
  }>;
}

const TilesGrid: React.FC<TilesGridProps> = ({ tiles }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full max-w-[1800px] mx-auto">
        {tiles.map((tile, index) => (
          <Tile
            key={index}
            title={tile.title}
            links={tile.links}
            icon={tile.icon}
            iconBgColor={tile.iconBgColor}
            iconColor={tile.iconColor}
            borderTopColor={tile.borderTopColor}
          />
        ))}
      </div>
    </div>
  );
};

export default TilesGrid;
