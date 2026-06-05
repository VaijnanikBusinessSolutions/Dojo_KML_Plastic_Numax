import React, { useEffect, useRef } from 'react';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { Button } from '../../atoms/Buttons/Button';
import { Icon } from '../../atoms/Icons/Icon';
import { Text } from '../../atoms/Text/Text';

interface UserDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  userInitial: string;
  userEmail: string;
  userName: string;
  userInitials: string;
  onLogout?: () => void;
  onPrivacyPolicy?: () => void;
  onTermsOfService?: () => void;
  onVersion?: () => void;
  className?: string;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  isOpen,
  onToggle,
  onClose,
  userInitial,
  userEmail,
  userName,
  userInitials,
  onLogout,
  onPrivacyPolicy,
  onTermsOfService,
  onVersion,
  className = ''
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('Clicked outside, closing dropdown');
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add listeners immediately
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Avatar
        initial={userInitial}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      />
      
      {isOpen && (
        <>
          {/* Invisible overlay to catch clicks */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          <div 
            className="absolute right-0 mt-2 w-96 bg-gray-100 border border-gray-200 rounded-2xl shadow-2xl z-50 text-[#001740]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end pt-3 pr-4">
              <Button variant="ghost" onClick={onClose}>
                <Icon name="close" />
              </Button>
            </div>
            
            <div className="px-6 text-sm text-center text-gray-500 -mt-2">
              {userEmail}
            </div>
            
            <div className="flex flex-col items-center px-6 pt-4 pb-3">
              <Avatar
                initial={userInitials}
                size="lg"
              />
              <Text className="mt-2 text-xl font-semibold">
                Hi, {userName}!
              </Text>
            </div>
            
            <div className="px-6 py-2 flex justify-center">
              <Button
                onClick={onLogout}
                variant="secondary"
                className="w-[50%] flex items-center justify-center gap-2 text-sm rounded-full py-2 shadow"
              >
                <Icon name="logout" size="sm" />
                Sign Out
              </Button>
            </div>
            
            <div className="mt-[80px] border-t border-gray-200 text-center text-sm text-gray-400 px-4 py-4 flex justify-center gap-2">
              <span onClick={onPrivacyPolicy} className="hover:underline cursor-pointer">
                Privacy policy
              </span>
              <span> | </span>
              <span onClick={onTermsOfService} className="hover:underline cursor-pointer">
                Terms of service
              </span>
              <span> | </span>
              <span onClick={onVersion} className="hover:underline cursor-pointer">
                Version
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};