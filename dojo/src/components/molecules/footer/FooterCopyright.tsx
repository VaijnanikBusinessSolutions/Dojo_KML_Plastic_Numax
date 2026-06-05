import React from 'react';

interface FooterCopyrightProps {
  companyName: string;
  companyUrl: string;
}

export const FooterCopyright: React.FC<FooterCopyrightProps> = ({ companyName, companyUrl }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className='text-center w-full md:w-auto text-sm font-semibold'>
      © {currentYear}{" "}
      <a
        href={companyUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='text-[#1E3A46] hover:underline font-medium'
      >
        {companyName}
      </a>
      . All rights reserved.
    </div>
  );
};