// import React from 'react';

// interface FooterLogoProps {
//   isLoading?: boolean;
//   logoUrl?: string;
//   companyName: string;
// }

// export const FooterLogo: React.FC<FooterLogoProps> = ({ isLoading, logoUrl, companyName }) => {
//   return (
//     <div className='flex justify-center md:justify-start w-full md:w-auto'>
//       {isLoading ? (
//         <div className='h-28 w-40 bg-gray-200 rounded animate-pulse'></div>
//       ) : logoUrl ? (
//         <img
//           src={logoUrl}
//           alt={companyName}
//           className='h-20 w-auto max-w-[200px] object-contain'
//         />
//       ) : (
//         <div className='text-2xl font-semibold'>
//           {companyName}
//         </div>
//       )}
//     </div>
//   );
// };



import React from 'react';

interface FooterLogoProps {
  isLoading?: boolean;
  logoUrl?: string;
  companyName: string;
}

export const FooterLogo: React.FC<FooterLogoProps> = ({ isLoading, logoUrl, companyName }) => {
  return (
    <div className='flex justify-center md:justify-start w-full md:w-auto'>
      {isLoading ? (
        <div className='h-28 w-40 bg-gray-200 rounded animate-pulse'></div>
      ) : logoUrl ? (
        <img
          src={logoUrl}
          alt={companyName}
          // 1. Changed h-20 to h-28 (or h-32/h-40 for bigger)
          // 2. REMOVED 'max-w-[200px]' so the width can expand freely
          className='h-16 w-auto object-contain' 
        />
      ) : (
        <div className='text-2xl font-semibold'>
          {companyName}
        </div>
      )}
    </div>
  );
};