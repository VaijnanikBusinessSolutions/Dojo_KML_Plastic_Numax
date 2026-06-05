import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import type { AttendanceLog, BiometricDevice } from '../types';

interface Props {
  logs: AttendanceLog[];
  devices: BiometricDevice[];
}

const MachineActivityChart: React.FC<Props> = ({ logs, devices }) => {
  
  // --- FILTER: Show ONLY Production Machines (Exclude Gate & Enrollment) ---
  const productionDevices = useMemo(() => {
      return devices.filter(d => 
          !d.is_attendance_device && 
          !d.is_enrollment_device  // <--- FIX: Exclude Enrollment Device
      );
  }, [devices]);

  const chartData = useMemo(() => {
    // 1. Map Serial Number -> Friendly Name for easy lookup
    const machineMap = new Map<string, string>();
    
    productionDevices.forEach(d => {
        if(d.serial_number) machineMap.set(d.serial_number, d.name);
    });

    // If no machine devices, return empty
    if (machineMap.size === 0) return [];

    // 2. Create Time Buckets (08:00 to 20:00)
    const startHour = 8;
    const endHour = 20;
    const data = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      const entry: any = { time: `${hour}:00` };
      // Initialize counts to 0 for all machines
      machineMap.forEach((name) => (entry[name] = 0));
      return entry;
    });

    // 3. Fill with Data (Matching by Serial Number)
    logs.forEach(log => {
      // Check if this log belongs to a known Machine Device
      const machineName = machineMap.get(log.device_sn);
      
      if (machineName) {
        const logDate = new Date(log.datetime);
        const hour = logDate.getHours();
        const index = hour - startHour;
        
        if (index >= 0 && index < data.length) {
          data[index][machineName] += 1;
        }
      }
    });

    return data;
  }, [logs, productionDevices]);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="font-bold text-gray-700 text-lg">Machine Utilization</h3>
            <p className="text-xs text-gray-400">Man-Machine Activity (Matched by Serial No)</p>
        </div>
        <div className="flex gap-2">
             <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold">Live Data</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                {/* --- USE FILTERED LIST FOR GRADIENTS --- */}
                {productionDevices.map((dev, i) => (
                    <linearGradient key={dev.id} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                    </linearGradient>
                ))}
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '10px'}}/>
                
                {/* --- USE FILTERED LIST FOR AREAS --- */}
                {productionDevices.map((dev, i) => (
                    <Area 
                        key={dev.id}
                        type="monotone" 
                        dataKey={dev.name} // Display Name
                        stroke={colors[i % colors.length]} 
                        fillOpacity={1} 
                        fill={`url(#color${i})`} 
                        stackId="1"
                    />
                ))}
            </AreaChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                <p className="font-bold">No Machine Activity</p>
                <p className="text-xs">Ensure "Machine Control" devices are added with correct Serial Numbers.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MachineActivityChart;

// import React, { useMemo } from 'react';
// import { 
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
// } from 'recharts';
// import type { AttendanceLog, BiometricDevice } from '../types';

// interface Props {
//   logs: AttendanceLog[];
//   devices: BiometricDevice[];
// }

// const MachineActivityChart: React.FC<Props> = ({ logs, devices }) => {
  
//   const chartData = useMemo(() => {
//     // 1. Get List of Machine Devices (Exclude Attendance Gates)
//     // Map Serial Number -> Friendly Name for easy lookup
//     const machineMap = new Map<string, string>();
//     devices.filter(d => !d.is_attendance_device).forEach(d => {
//         if(d.serial_number) machineMap.set(d.serial_number, d.name);
//     });

//     // If no machine devices, return empty
//     if (machineMap.size === 0) return [];

//     // 2. Create Time Buckets (08:00 to 20:00)
//     const startHour = 8;
//     const endHour = 20;
//     const data = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
//       const hour = startHour + i;
//       const entry: any = { time: `${hour}:00` };
//       // Initialize counts to 0 for all machines
//       machineMap.forEach((name) => (entry[name] = 0));
//       return entry;
//     });

//     // 3. Fill with Data (Matching by Serial Number)
//     logs.forEach(log => {
//       // Check if this log belongs to a known Machine Device
//       const machineName = machineMap.get(log.device_sn);
      
//       if (machineName) {
//         const logDate = new Date(log.datetime);
//         const hour = logDate.getHours();
//         const index = hour - startHour;
        
//         if (index >= 0 && index < data.length) {
//           data[index][machineName] += 1;
//         }
//       }
//     });

//     return data;
//   }, [logs, devices]);

//   const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//             <h3 className="font-bold text-gray-700 text-lg">Machine Utilization</h3>
//             <p className="text-xs text-gray-400">Man-Machine Activity (Matched by Serial No)</p>
//         </div>
//         <div className="flex gap-2">
//              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold">Live Data</span>
//         </div>
//       </div>

//       <div className="flex-1 w-full min-h-0">
//         {chartData.length > 0 ? (
//             <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//                 <defs>
//                 {devices.filter(d => !d.is_attendance_device).map((dev, i) => (
//                     <linearGradient key={dev.id} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.8}/>
//                         <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
//                     </linearGradient>
//                 ))}
//                 </defs>
//                 <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
//                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
//                 <CartesianGrid vertical={false} stroke="#F3F4F6" />
//                 <Tooltip 
//                     contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
//                 />
//                 <Legend iconType="circle" wrapperStyle={{paddingTop: '10px'}}/>
                
//                 {devices.filter(d => !d.is_attendance_device).map((dev, i) => (
//                     <Area 
//                         key={dev.id}
//                         type="monotone" 
//                         dataKey={dev.name} // Display Name
//                         stroke={colors[i % colors.length]} 
//                         fillOpacity={1} 
//                         fill={`url(#color${i})`} 
//                         stackId="1"
//                     />
//                 ))}
//             </AreaChart>
//             </ResponsiveContainer>
//         ) : (
//             <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
//                 <p className="font-bold">No Machine Activity</p>
//                 <p className="text-xs">Ensure "Machine Control" devices are added with correct Serial Numbers.</p>
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MachineActivityChart;