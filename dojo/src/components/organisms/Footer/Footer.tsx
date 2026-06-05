import React from 'react';
import { FooterLogo } from '../../molecules/footer/FooterLogo';
import { FooterTagline } from '../../molecules/footer/FooterTagline';
import { FooterCopyright } from '../../molecules/footer/FooterCopyright';

// Props for the main Footer component
interface FooterProps {
  isLoading?: boolean;
  logoUrl?: string;
  companyName: string;
  companyUrl: string;
  tagline: string;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  isLoading,
  logoUrl,
  companyName,
  companyUrl,
  tagline,
  className = ''
}) => {
  return (
    <footer className={`bg-white text-[#1E3A46] text-sm ${className}`}>
      <div className='flex flex-col md:flex-row justify-between items-center md:px-16 py-4 space-y-4 md:space-y-0'>
        
        {/* Logo or Loading or Text */}
        <FooterLogo 
          isLoading={isLoading} 
          logoUrl={logoUrl} 
          companyName={companyName} 
        />

        {/* Tagline */}
        <FooterTagline tagline={tagline} />

        {/* Copyright */}
        <FooterCopyright 
          companyName={companyName} 
          companyUrl={companyUrl} 
        />

      </div>
    </footer>
  );
};