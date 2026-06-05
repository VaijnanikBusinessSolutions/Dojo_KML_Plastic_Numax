



// import React from 'react';
// import { FileText } from 'lucide-react';
// import type { TrainingTopic, FormData } from '../../constants/types';

// interface QualityAssessmentFormProps {
//   currentTopics: TrainingTopic[];
//   days: string[];
//   formData: FormData;
//   handleScoreChange: (topicId: number, day: string, value: string) => void;
//   scoreRanges: { min_score: number; max_score: number } | null;
//   lastFilledDayIndex: number; // determines which day is last filled
// }

// const QualityAssessmentForm: React.FC<QualityAssessmentFormProps> = ({
//   currentTopics,
//   days,
//   formData,
//   scoreRanges,
//   lastFilledDayIndex,
//   handleScoreChange
// }) => {
//   const getCategoryColor = (category: string) => {
//     const colors = {
//       'Technical Knowledge': 'bg-blue-100 text-blue-800 border-blue-200',
//       'Safety': 'bg-red-100 text-red-800 border-red-200',
//       'Process': 'bg-green-100 text-green-800 border-green-200',
//       'Quality': 'bg-purple-100 text-purple-800 border-purple-200',
//       'Production': 'bg-orange-100 text-orange-800 border-orange-200',
//     };
//     return (
//       colors[category as keyof typeof colors] ||
//       'bg-gray-100 text-gray-800 border-gray-200'
//     );
//   };

//   return (
//     <div className="mb-10">
//       <div className="flex items-center gap-3 mb-8">
//         <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
//           <FileText className="w-5 h-5 text-white" />
//         </div>
//         <h2 className="text-2xl font-bold text-gray-800">
//           Training Topics & Daily Assessment
//         </h2>
//       </div>

//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
//                 <th className="px-6 py-4 text-left text-sm font-bold tracking-wide">
//                   S.NO.
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-bold tracking-wide min-w-[350px]">
//                   TRAINING TOPIC
//                 </th>
//                 <th className="px-6 py-4 text-center text-sm font-bold tracking-wide">
//                   CATEGORY
//                 </th>
//                 {days.map((day) => (
//                   <th
//                     key={day}
//                     className="px-4 py-4 text-center text-sm font-bold tracking-wide min-w-[100px] bg-gradient-to-b from-blue-600 to-blue-700"
//                   >
//                     {day}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {currentTopics.map((topic, index) => (
//                 <tr
//                   key={topic.id}
//                   className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
//                     index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
//                   }`}
//                 >
//                   <td className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-r border-gray-200">
//                     {index + 1}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-800 font-medium border-r border-gray-200">
//                     {topic.description}
//                   </td>
//                   <td className="px-4 py-4 text-center border-r border-gray-200">
//                     <span
//                       className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
//                         topic.category
//                       )}`}
//                     >
//                       {topic.category}
//                     </span>
//                   </td>
//                   {days.map((day, dayIndex) => {
//                     const isEditable = dayIndex === lastFilledDayIndex + 1;
//                     return (
//                       <td
//                         key={day}
//                         className="px-3 py-4 border-r border-gray-200"
//                       >
//                         <input
//                           type="number"
//                           min={scoreRanges?.min_score ?? 0}
//                           max={scoreRanges?.max_score ?? 10}
//                           step="1"
//                           value={formData.dailyScores[topic.id]?.[day] || ''}
//                           disabled={!isEditable}
//                           onChange={(e) => {
//                             const value = e.target.value;
//                             const min = scoreRanges?.min_score ?? 0;
//                             const max = scoreRanges?.max_score ?? 10;

//                             if (value === '') {
//                               handleScoreChange(topic.id, day, '');
//                               return;
//                             }

//                             const num = parseInt(value, 10);
//                             if (!isNaN(num) && num >= min && num <= max) {
//                               handleScoreChange(topic.id, day, value);
//                             }
//                           }}
//                           className={`w-full px-3 py-2 text-center border-2 rounded-lg text-sm font-semibold transition-all duration-200
//                             ${
//                               isEditable
//                                 ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-blue-300'
//                                 : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
//                             }`}
//                           placeholder={`${scoreRanges?.min_score ?? 0}-${
//                             scoreRanges?.max_score ?? 10
//                           }`}
//                         />
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QualityAssessmentForm;



// QualityAssessmentForm.tsx - Quality-based training topics and daily assessment






import React from 'react';
import { FileText } from 'lucide-react';
import type { TrainingTopic, FormData } from '../../constants/types';

interface QualityAssessmentFormProps {
  currentTopics: TrainingTopic[];
  days: string[];
  formData: FormData;
  handleScoreChange: (topicId: number, day: string, value: string) => void;
  scoreRanges: { min_score: number; max_score: number } | null;
  lastFilledDayIndex: number; // determines which day is last filled
}

const QualityAssessmentForm: React.FC<QualityAssessmentFormProps> = ({
  currentTopics,
  days,
  formData,
  scoreRanges,
  lastFilledDayIndex,
  handleScoreChange
}) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Technical Knowledge': 'bg-blue-100 text-blue-800 border-blue-200',
      'Safety': 'bg-red-100 text-red-800 border-red-200',
      'Process': 'bg-green-100 text-green-800 border-green-200',
      'Quality': 'bg-purple-100 text-purple-800 border-purple-200',
      'Production': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return (
      colors[category as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  };

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Training Topics & Daily Assessment
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <th className="px-6 py-4 text-left text-sm font-bold tracking-wide">
                  S.NO.
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold tracking-wide min-w-[350px]">
                  TRAINING TOPIC
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold tracking-wide">
                  CATEGORY
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-4 text-center text-sm font-bold tracking-wide min-w-[100px] bg-gradient-to-b from-blue-600 to-blue-700"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTopics.map((topic, index) => (
                <tr
                  key={topic.id}
                  className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                  }`}
                >
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-r border-gray-200">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium border-r border-gray-200">
                    {topic.description}
                  </td>
                  <td className="px-4 py-4 text-center border-r border-gray-200">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                        topic.category
                      )}`}
                    >
                      {topic.category}
                    </span>
                  </td>
                  {days.map((day, dayIndex) => {
                    const isEditable = dayIndex === lastFilledDayIndex + 1;
                    return (
                      <td
                        key={day}
                        className="px-3 py-4 border-r border-gray-200"
                      >
                        <input
                          type="number"
                          min={scoreRanges?.min_score ?? 0}
                          max={scoreRanges?.max_score ?? 10}
                          step="1"
                          value={formData.dailyScores[topic.id]?.[day] || ''}
                          disabled={!isEditable}
                          onChange={(e) => {
                            const value = e.target.value;
                            const min = scoreRanges?.min_score ?? 0;
                            const max = scoreRanges?.max_score ?? 10;

                            if (value === '') {
                              handleScoreChange(topic.id, day, '');
                              return;
                            }

                            const num = parseInt(value, 10);
                            if (!isNaN(num) && num >= min && num <= max) {
                              handleScoreChange(topic.id, day, value);
                            }
                          }}
                          className={`w-full px-3 py-2 text-center border-2 rounded-lg text-sm font-semibold transition-all duration-200
                            ${
                              isEditable
                                ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-blue-300'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                            }`}
                          placeholder={`${scoreRanges?.min_score ?? 0}-${
                            scoreRanges?.max_score ?? 10
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QualityAssessmentForm;


