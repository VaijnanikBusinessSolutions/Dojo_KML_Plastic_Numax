import React from "react";

interface Subtopic {
  dataKey: string;
  displayText: string;
}

interface CardProps {
  subtopics: Subtopic[];
  data: Record<string, number> | null;
  loading: boolean;
  cardColors: string[];
}

const CardProps: React.FC<CardProps> = ({
  subtopics,
  data,
  loading,
  cardColors
}) => {
  // This helper function is correct, no changes needed
  const getValue = (dataKey: string): number => {
    if (!data) return 0;
    return data[dataKey] ?? 0;
  };

  if (loading) {
    return (
      <div className="w-full mx-auto">
        {/* --- CHANGE IS HERE: Adjusted grid to better fit 8 items --- */}
        <div className={`grid grid-cols-4 md:grid-cols-8 gap-3`}>
          {subtopics.map((subtopic, index) => (
            <div
              key={subtopic.dataKey}
              className="aspect-[4/3] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-1"
              style={{ backgroundColor: cardColors[index] || "#4CAF50" }}
            >
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-5 w-12 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 w-16 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full mx-auto">
        {/* --- CHANGE IS HERE: Adjusted grid to better fit 8 items --- */}
        <div className={`grid grid-cols-4 md:grid-cols-8 gap-3`}>
          {subtopics.map((subtopic, index) => (
            <div
              key={subtopic.dataKey}
              className="aspect-[4/3] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-1"
              style={{ backgroundColor: cardColors[index] || "#4CAF50" }}
            >
              <span className="text-sm font-semibold text-white text-center">
                No data
              </span>
              <span className="text-xs mt-1 text-center leading-tight opacity-90">
                {subtopic.displayText}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* 
        --- THE ONLY CHANGE IS ON THIS LINE ---
        Changed "sm:grid-cols-6 lg:grid-cols-8" to "md:grid-cols-8"
        This means it will show 4 columns on mobile and 8 columns on tablets and desktops,
        ensuring L4 is always visible on larger screens.
      */}
      <div className={`grid grid-cols-4 md:grid-cols-8 gap-3`}>
        {subtopics.map((subtopic, index) => {
          const value = getValue(subtopic.dataKey);

          return (
            <div
              key={subtopic.dataKey}
              className="aspect-[4/3] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-1 transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: cardColors[index] || "#4CAF50" }}
            >
              <span className="text-xl md:text-2xl font-bold">
                {value.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs mt-1 text-center leading-tight">
                {subtopic.displayText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
 
// Renamed component to avoid conflict with the interface name
export default CardProps;



// import React from "react";

// interface Subtopic {
//   dataKey: string;
//   displayText: string;
// }

// // Renamed interface to avoid conflict with component name, a TypeScript best practice
// interface CardProps {
//   subtopics: Subtopic[];
//   data: Record<string, number> | null;
//   loading: boolean;
//   cardColors: string[];
// }

// const CardProps: React.FC<CardProps> = ({
//   subtopics,
//   data,
//   loading,
//   cardColors
// }) => {
//   const getValue = (dataKey: string): number => {
//     if (!data) return 0;
//     return data[dataKey] ?? 0;
//   };

//   // --- CHANGE 1: Logic to group subtopics into pairs ---
//   const topicPairs: Subtopic[][] = [];
//   for (let i = 0; i < subtopics.length; i += 2) {
//     // Pushes pairs like [plan_l1, actual_l1] into the new array
//     if (subtopics[i + 1]) {
//       topicPairs.push([subtopics[i], subtopics[i + 1]]);
//     } else {
//       // Handles cases with an odd number of items
//       topicPairs.push([subtopics[i]]);
//     }
//   }

//   // --- CHANGE 2: The entire JSX is updated to use the new paired layout ---
//   if (loading) {
//     return (
//       <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
//         {topicPairs.map((_, index) => (
//           <div key={index} className="grid grid-cols-2 gap-3">
//             {/* Skeleton for the left card */}
//             <div className="aspect-[2/1] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-2" style={{ backgroundColor: cardColors[index * 2] || "#9E9E9E" }}>
//               <div className="animate-pulse flex flex-col items-center">
//                 <div className="h-6 w-10 bg-gray-300 rounded mb-1"></div>
//                 <div className="h-4 w-16 bg-gray-300 rounded"></div>
//               </div>
//             </div>
//             {/* Skeleton for the right card */}
//             <div className="aspect-[2/1] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-2" style={{ backgroundColor: cardColors[index * 2 + 1] || "#9E9E9E" }}>
//               <div className="animate-pulse flex flex-col items-center">
//                 <div className="h-6 w-10 bg-gray-300 rounded mb-1"></div>
//                 <div className="h-4 w-16 bg-gray-300 rounded"></div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
//         {topicPairs.map((pair, index) => (
//           <div key={index} className="grid grid-cols-2 gap-3">
//             {/* "No Data" card for the left item */}
//             <div className="aspect-[2/1] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-2" style={{ backgroundColor: cardColors[index * 2] || "#9E9E9E" }}>
//               <span className="text-lg font-semibold">N/A</span>
//               <span className="text-xs mt-1 text-center">{pair[0]?.displayText}</span>
//             </div>
//              {/* "No Data" card for the right item */}
//             <div className="aspect-[2/1] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-2" style={{ backgroundColor: cardColors[index * 2 + 1] || "#9E9E9E" }}>
//               <span className="text-lg font-semibold">N/A</span>
//               <span className="text-xs mt-1 text-center">{pair[1]?.displayText}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
//       {topicPairs.map((pair, index) => (
//         <div key={index} className="grid grid-cols-2 gap-3">
//           {/* Renders the first card in the pair (e.g., Plan / Required) */}
//           <div
//             className="aspect-[2/1] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-2 transition-all duration-200 hover:shadow-lg"
//             style={{ backgroundColor: cardColors[index * 2] || "#4CAF50" }}
//           >
//             <span className="text-2xl font-bold">{getValue(pair[0].dataKey).toLocaleString()}</span>
//             <span className="text-xs mt-1 text-center">{pair[0].displayText}</span>
//           </div>

//           {/* Renders the second card in the pair (e.g., Actual / Available), if it exists */}
//           {pair[1] && (
//             <div
//               className="aspect-[2/1] rounded-lg shadow-md flex flex-col justify-center items-center text-white p-2 transition-all duration-200 hover:shadow-lg"
//               style={{ backgroundColor: cardColors[index * 2 + 1] || "#4CAF50" }}
//             >
//               <span className="text-2xl font-bold">{getValue(pair[1].dataKey).toLocaleString()}</span>
//               <span className="text-xs mt-1 text-center">{pair[1].displayText}</span>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };
 
// export default CardProps;