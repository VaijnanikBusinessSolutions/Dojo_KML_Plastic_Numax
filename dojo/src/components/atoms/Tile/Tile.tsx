import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TileProps } from './types';

const Tile: React.FC<TileProps> = ({
  title,
  links,
  icon: Icon,
  iconBgColor = "bg-[#0b1f4c]",
  iconColor = "text-white",
  borderTopColor = "border-t-[#001740]",
  disabled = false
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (disabled) return;
    navigate(path);
  };

  return (
    <div className={`
      bg-white border border-gray-200 border-t-[4px] ${borderTopColor} 
      rounded-2xl p-4 sm:p-6 w-full
      shadow-md hover:shadow-lg transition-shadow duration-300
      ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
    `}>
      {/* Header with icon and title */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {Icon && (
            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
            </div>
          )}
          <h2 className="text-[#0b1f4c] text-lg sm:text-xl font-bold truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* Links grid - ALWAYS 2 columns */}
      <div className={`grid grid-cols-2 gap-2 sm:gap-3 ${disabled ? 'pointer-events-none' : ''}`}>
        {links.map((link, index) => (
          link.name && (
            <div
              key={index}
              className={`group flex flex-col items-center text-center p-2 sm:p-3 rounded-lg transition-colors duration-200 ${
                disabled ? '' : 'hover:bg-gray-100 cursor-pointer'
              }`}
              onClick={() => !disabled && handleNavigation(link.path)}
            >
              {link.icon && (
                <div className={`w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 rounded-full flex items-center justify-center ${
                  disabled ? '' : 'group-hover:bg-gray-300'
                } mb-1 sm:mb-2`}>
                  <link.icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </div>
              )}
              <span className={`text-xs sm:text-sm ${
                disabled ? 'text-gray-500' : 'text-gray-700 group-hover:text-[#0b1f4c]'
              } font-medium line-clamp-2`}>
                {link.name}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Tile;
