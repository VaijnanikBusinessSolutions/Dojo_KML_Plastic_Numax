import React from 'react';
import { FiServer, FiLink, FiCheck, FiUnlock, FiPower, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaCogs } from 'react-icons/fa';
import type { BiometricDevice } from '../types';
import * as API from '../api';

interface Props {
    device: BiometricDevice;
    isAuthorized: boolean; // <--- NEW PROP
    onEdit: (device: BiometricDevice) => void;
    onDelete: (id: number) => void;
}

const DeviceCard: React.FC<Props> = ({ device, isAuthorized, onEdit, onDelete }) => {
    
    const handleAction = async (action: 'unlock' | 'reboot') => {
        if (!confirm(`Confirm ${action} for ${device.name}?`)) return;
        try {
            const res = action === 'unlock' ? await API.unlockDevice(device.id) : await API.rebootDevice(device.id);
            alert(res.status === 'success' ? "Success!" : "Failed");
        } catch (e) { alert("Connection Error"); }
    };

    const isMachine = !device.is_attendance_device;

    return (
        <div className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group transition-all hover:shadow-md ${isMachine ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-green-500'}`}>
            
            {/* EDIT / DELETE ACTIONS - ONLY SHOW IF AUTHORIZED */}
            {isAuthorized && (
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 rounded border border-gray-100 shadow-sm">
                    <button onClick={() => onEdit(device)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => onDelete(device.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            )}

            <div className="flex justify-between items-start mb-3 pr-16">
                <div className={`p-2 rounded-lg ${isMachine ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {isMachine ? <FaCogs size={20} /> : <FiServer size={20} />}
                </div>
                {device.machine_name && (
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><FiLink /> {device.machine_name}</span>
                // ) : (
                    // <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><FiCheck /> Attendance</span>
                )}

                {device.is_attendance_device && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><FiCheck /> Attendance</span>
                )}

                {/* --- NEW INDICATOR --- */}
                {device.is_enrollment_device && (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200">
                        ★ Enrollment
                    </span>
                )}
            </div>

            <h3 className="font-bold text-lg text-gray-800 truncate mb-4" title={device.name || "Device"}>
                {device.name}
            </h3>
            {isAuthorized && (
                <div className="grid grid-cols-2 gap-2 border-t pt-3">
                    <button onClick={() => handleAction('reboot')} className="bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 flex justify-center items-center gap-1 border border-gray-200">
                        <FiPower/> Reboot
                    </button>
                    <button onClick={() => handleAction('unlock')} className={`py-2 rounded-lg text-xs font-bold text-white flex justify-center items-center gap-1 ${isMachine ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        <FiUnlock/> {isMachine ? 'Override' : 'Unlock'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeviceCard;

// import React from 'react';
// import { FiServer, FiLink, FiCheck, FiUnlock, FiPower, FiCpu, FiEdit2, FiTrash2 } from 'react-icons/fi';
// import { FaCogs } from 'react-icons/fa';
// import type { BiometricDevice } from '../types';
// import * as API from '../api';

// // Export Props interface if needed, but local is fine too
// interface Props {
//     device: BiometricDevice;
//     onEdit: (device: BiometricDevice) => void;
//     onDelete: (id: number) => void;
// }

// const DeviceCard: React.FC<Props> = ({ device, onEdit, onDelete }) => {
    
//     const handleAction = async (action: 'unlock' | 'reboot') => {
//         if (!confirm(`Confirm ${action} for ${device.name}?`)) return;
//         try {
//             const res = action === 'unlock' ? await API.unlockDevice(device.id) : await API.rebootDevice(device.id);
//             alert(res.status === 'success' ? "Success!" : "Failed");
//         } catch (e) { alert("Connection Error"); }
//     };

//     const isMachine = !device.is_attendance_device;

//     return (
//         <div className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group transition-all hover:shadow-md ${isMachine ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-green-500'}`}>
            
//             {/* EDIT / DELETE ACTIONS */}
//             <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 rounded border border-gray-100 shadow-sm">
//                 <button onClick={() => onEdit(device)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
//                     <FiEdit2 size={14} />
//                 </button>
//                 <button onClick={() => onDelete(device.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
//                     <FiTrash2 size={14} />
//                 </button>
//             </div>

//             <div className="flex justify-between items-start mb-3 pr-16">
//                 <div className={`p-2 rounded-lg ${isMachine ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
//                     {isMachine ? <FaCogs size={20} /> : <FiServer size={20} />}
//                 </div>
//                 {device.machine_name ? (
//                     <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><FiLink /> {device.machine_name}</span>
//                 ) : (
//                     <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><FiCheck /> Attendance</span>
//                 )}
//             </div>

//             {/* FIX: Ensure title is string, never null */}
//             <h3 className="font-bold text-lg text-gray-800 truncate mb-4" title={device.name || "Device"}>
//                 {device.name}
//             </h3>
//             {/* <p className="text-xs text-gray-500 font-mono mb-4">{device.ip_address} | {device.serial_number}</p> */}

//             {/*<div className="grid grid-cols-2 gap-2 border-t pt-3">
//                 <button onClick={() => handleAction('reboot')} className="bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 flex justify-center items-center gap-1 border border-gray-200">
//                     <FiPower/> Reboot
//                 </button>
//                 <button onClick={() => handleAction('unlock')} className={`py-2 rounded-lg text-xs font-bold text-white flex justify-center items-center gap-1 ${isMachine ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}>
//                     <FiUnlock/> {isMachine ? 'Override' : 'Unlock'}
//                 </button>
//             </div>*/}
//         </div>
//     );
// };

// export default DeviceCard;
