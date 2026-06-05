import React from 'react';

interface FooterTaglineProps {
  tagline: string;
}

export const FooterTagline: React.FC<FooterTaglineProps> = ({ tagline }) => {
  return (
    <div className='text-center text-[#1E3A46] text-sm font-semibold w-full md:w-auto'>
      {tagline}
    </div>
  );
};