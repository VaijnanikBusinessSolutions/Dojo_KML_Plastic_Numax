import React, { useState } from 'react';
import { CompanyLogo } from '../../molecules/CompanyLogo/CompanyLogo';
import { AppTitle } from '../../molecules/AppTitle/AppTitle';
import { NavigationControls } from '../../molecules/NavigationControls/NavigationControls';
import { UserDropdown } from '../../molecules/UserDropdown/UserDropdown';

interface User {
  first_name: string;
  last_name?: string;
  email: string;
}

interface NavbarProps {
  user: User;
  onNavigateHome?: () => void;
  onNavigateBack?: () => void;
  onNavigateToRoot?: () => void;
  onLogout?: () => void;
  onPrivacyPolicy?: () => void;
  onTermsAndConditions?: () => void;
  onVersionControl?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onNavigateHome,
  onNavigateBack,
  onNavigateToRoot,
  onLogout,
  onPrivacyPolicy,
  onTermsAndConditions,
  onVersionControl,
  className = ''
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitial = () => {
    if (!user?.first_name) return 'U';
    return user.first_name.charAt(0).toUpperCase();
  };

  const getUserInitials = () => {
    const firstInitial = user?.first_name?.charAt(0).toUpperCase() || '';
    const lastInitial = user?.last_name?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  if (!user) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center text-[#001740] z-50 ${className}`}>
      {/* Left: Company Logo */}
      <CompanyLogo />

      {/* Center: App Title */}
      <AppTitle onClick={onNavigateHome} /> 

      {/* Right: Navigation Controls and User Dropdown */}
      <div className="flex items-center gap-4">
        <NavigationControls 
          onBack={onNavigateBack}
          onHome={onNavigateToRoot}
        />
        
        <UserDropdown
          isOpen={dropdownOpen}
          onToggle={() => setDropdownOpen(!dropdownOpen)}
          onClose={() => setDropdownOpen(false)}
          userInitial={getInitial()}
          userEmail={user.email}
          userName={user.first_name}
          userInitials={getUserInitials()}
          onLogout={onLogout}
          onPrivacyPolicy={onPrivacyPolicy}
          onTermsOfService={onTermsAndConditions}
          onVersion={onVersionControl}
        />
      </div>
    </nav>
  );
};