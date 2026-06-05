

// import React, { useState, useEffect } from "react";
// import styles from "./trainingcard.module.css";



// interface TrainingSummaryCardProps {
//   title: string;
//   getUrl: string;
//   subtopics: {
//     dataKey: string;
//     displayText: string;
//   }[];
//   cardColors: string[];
// }

// const TrainingSummaryCard: React.FC<TrainingSummaryCardProps> = ({ 
//   title, 
//   getUrl,
//   subtopics,
//   cardColors 
// }) => {
//   const [data, setData] = useState<Record<string, number>>({});

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(getUrl);
//         const result = await response.json();
//         setData(result);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, [getUrl]);

//   return (
//     <div className={styles.card}>
//       <h2 className={styles.heading}>{title}</h2>
//       <div className={styles.boxContainer}>
//         {subtopics.map((subtopic, index) => (
//           <div
//             key={subtopic.dataKey}
//             className={styles.box}
//             style={{ backgroundColor: cardColors[index] }}
//           >
//             <span className={styles.number}>{data[subtopic.dataKey] || 0}</span>
//             <span className={styles.text}>{subtopic.displayText}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TrainingSummaryCard;



import React, { useState, useEffect } from "react";
import styles from "./trainingcard.module.css";

interface TrainingSummaryCardProps {
  title: string;
  getUrl: string;
  subtopics: {
    dataKey: string;
    displayText: string;
  }[];
  cardColors: string[];
  // Added hierarchy props
  hqId?: string;
  factoryId?: string;
  departmentId?: string;
  lineId?: string;
  sublineId?: string;
  stationId?: string;
}

const TrainingSummaryCard: React.FC<TrainingSummaryCardProps> = ({ 
  title, 
  getUrl,
  subtopics,
  cardColors,
  hqId,
  factoryId,
  departmentId,
  lineId,
  sublineId,
  stationId
}) => {
  const [data, setData] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Construct URL with query params
        const params = new URLSearchParams();
        if (hqId) params.append('hq', hqId);
        if (factoryId) params.append('factory', factoryId);
        if (departmentId) params.append('department', departmentId);
        if (lineId) params.append('line', lineId);
        if (sublineId) params.append('subline', sublineId);
        if (stationId) params.append('station', stationId);

        const finalUrl = `${getUrl}?${params.toString()}`;
        
        const response = await fetch(finalUrl);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching summary data:', error);
        // Optional: Reset data to 0 on error
        setData({});
      }
    };

    fetchData();
  }, [getUrl, hqId, factoryId, departmentId, lineId, sublineId, stationId]);

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.boxContainer}>
        {subtopics.map((subtopic, index) => (
          <div
            key={subtopic.dataKey}
            className={styles.box}
            style={{ backgroundColor: cardColors[index] }}
          >
            <span className={styles.number}>{data[subtopic.dataKey] || 0}</span>
            <span className={styles.text}>{subtopic.displayText}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingSummaryCard;
