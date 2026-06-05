// import React from 'react';

// export interface HomepageHeaderProps {
//   logo: string | null;
//   logoLoading: boolean;
//   companyName: string;
// }

// const HomepageHeader: React.FC<HomepageHeaderProps> = ({
//   logo,
//   logoLoading,
//   companyName = 'KML',
// }) => {
//   return (
//     <div className='bg-[#010101] text-white text-center py-4 md:py-6 px-4 mb-6'>
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-7xl mx-auto">
//         {/* Logo Section - shown only on md screens and larger */}
//         <div className='flex justify-center md:justify-start mb-4 md:mb-0 pl-16'>
//           {logoLoading ? (
//             <div className='h-10 w-auto bg-gray-200 rounded animate-pulse'></div>
//           ) : logo ? (
//             <img
//               src={logo}
//               alt={companyName}
//               className='h-20 w-auto max-w-[200px] object-contain'
//             />
//           ) : (
//             <div className='text-2xl font-semibold'>{companyName}</div>
//           )}
//         </div>

//         {/* Text Section - centered on all screens */}
//         <div className="flex flex-col text-center md:text-center md:flex-1">
//           <h1 className="text-5xl md:text-3xl lg:text-4xl font-semibold mb-2">
//             Digital Operations Excellence
//           </h1>
//           <h2 className="text-lg md:text-2xl font-semibold mb-2">
//             Skill Development Platform
//           </h2>
//         </div>

//         {/* Empty space for balance - hidden on mobile */}
//         <div className="hidden md:block w-64"></div>
//       </div>
//     </div>
//   );
// };

// export default HomepageHeader;


import React from 'react';

export interface HomepageHeaderProps {
  logo: string | null;
  logoLoading: boolean;
  companyName: string;
}

const HomepageHeader: React.FC<HomepageHeaderProps> = ({
  logo,
  logoLoading,
  companyName = 'KML',
}) => {
  return (
    <div className='relative bg-gradient-to-br from-[#3D2817] via-[#2C1810] to-[#1A0F0A] text-white overflow-hidden md:py-6 px-4 mb-6'>
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D2691E] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8B4513] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-8 md:py-12 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-7xl mx-auto gap-6">

          {/* Logo Section */}
          <div className='flex justify-center md:justify-start mb-6 md:mb-0 md:pl-8 lg:pl-16'>
            {logoLoading ? (
              <div className='h-20 md:h-24 lg:h-28 w-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-lg animate-pulse backdrop-blur-sm'></div>
            ) : logo ? (
              <div className="relative group max-w-[600px] max-h-[300px]">
                <div></div>
                <img
                  src={logo}
                  alt={companyName}
                  className='relative h-20 md:h-24 lg:h-28 w-auto max-w-[600px] md:max-w-[300px] object-contain filter drop-shadow-2xl'
                />
              </div>
            ) : (
              <div className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                {companyName}
              </div>
            )}
          </div>

          {/* Text Section - Centered */}
          <div className="flex flex-col text-center md:flex-1 space-y-3">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 tracking-tight">
              <span className="bg-gradient-to-r from-[#F4A460] via-[#D2691E] to-[#CD853F] bg-clip-text text-transparent">
                Digital Operations Excellence
              </span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="hidden md:block h-px w-12 bg-gradient-to-r from-transparent to-[#D2691E]"></div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#DEB887]">
                Skill Development Platform
              </h2>
              <div className="hidden md:block h-px w-12 bg-gradient-to-l from-transparent to-[#D2691E]"></div>
            </div>
            <p className="text-sm md:text-base text-[#C19A6B] max-w-2xl mx-auto leading-relaxed">
              Empowering teams with cutting-edge training and development solutions
            </p>
          </div>

          {/* Balance Space - Hidden on mobile */}
          <div className="hidden md:block md:w-64 lg:w-72"></div>
        </div>

        {/* Decorative Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D2691E] to-transparent"></div>
      </div>
    </div>
  );
};

export default HomepageHeader;
