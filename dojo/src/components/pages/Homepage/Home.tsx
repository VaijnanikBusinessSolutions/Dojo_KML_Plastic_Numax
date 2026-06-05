import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../organisms/Navbar/Navbar';
import { NAVIGATION_ROUTES } from '../../constants/navigation';
import { API_ENDPOINTS } from '../../constants/api';
import HomepageHeader from '../../molecules/HomepageHeader/HomepageHeader';
import TilesGrid from '../../organisms/TilesGrid/TilesGrid';
import { tiles } from '../../constants/tileData';

// Mock user data - replace with your actual user state/context
const mockUser = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com'
};

interface CompanyLogo {
  id: number;
  name: string;
  logo: string;
  uploaded_at: string;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState<CompanyLogo | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyLogo = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LOGOS}`);
        const data = await response.json();
        // Get the first logo or the most recent one
        if (data && data.length > 0) {
          setCompanyLogo(data[0]);
        }
      } catch (error) {
        console.error('Error fetching company logo:', error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchCompanyLogo();
  }, []);

  const handleNavigateHome = () => navigate(NAVIGATION_ROUTES.HOME);
  const handleNavigateBack = () => navigate(-1);
  const handleNavigateToRoot = () => navigate(NAVIGATION_ROUTES.ROOT);
  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logout clicked');
    navigate(NAVIGATION_ROUTES.ROOT);
  };
  const handlePrivacyPolicy = () => navigate(NAVIGATION_ROUTES.PRIVACY_POLICY);
  const handleTermsAndConditions = () => navigate(NAVIGATION_ROUTES.TERMS_AND_CONDITIONS);
  const handleVersionControl = () => navigate(NAVIGATION_ROUTES.VERSION_CONTROL);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}  
      {/* <div className="sticky top-0 z-50 pt-16">
        <Navbar
          user={mockUser}
          onNavigateHome={handleNavigateHome}
          onNavigateBack={handleNavigateBack}
          onNavigateToRoot={handleNavigateToRoot}
          onLogout={handleLogout}
          onPrivacyPolicy={handlePrivacyPolicy}
          onTermsAndConditions={handleTermsAndConditions}
          onVersionControl={handleVersionControl}
        />
      </div> */}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <div className="w-full">
          <HomepageHeader 
            logo={companyLogo?.logo || null} 
            logoLoading={logoLoading} 
            companyName={companyLogo?.name || 'NL'}
          />
        </div>
        
        {/* Tiles Grid Section */}
        <div className="flex-1 px-4 pb-6">
          <TilesGrid tiles={tiles} />
        </div>
      </div>
      
      {/* Footer - Can be added here if needed */}
      {/* <div className="bg-gray-800 text-white p-4">
        Footer content goes here
      </div> */}
    </div>
  );
};