import React, { useState, useEffect } from 'react';
import { FiX, FiLink } from 'react-icons/fi';
import type { BiometricDevice, Machine } from '../types';
import * as API from '../api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    machines: Machine[];
    editingDevice?: BiometricDevice | null;
}

const AddDeviceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, machines, editingDevice }) => {
    const [form, setForm] = useState<Partial<BiometricDevice>>({
        name: '', 
        serial_number: '', 
        is_attendance_device: false,
        is_enrollment_device: false, // <--- Initialize this 
        linked_machine_id: null,
        ip_address: '', 
        port: 80 
    });

    useEffect(() => {
        if (editingDevice) {
            // Find which machine is CURRENTLY linked to this device ID
            const currentMachine = machines.find(m => m.biometric_device === editingDevice.id);
            
            setForm({
                ...editingDevice,
                ip_address: editingDevice.ip_address || '',
                // If found, use that ID. If not, use null.
                linked_machine_id: currentMachine ? currentMachine.id : null
            });
        } else {
            // Reset for Add Mode
            setForm({ 
                name: '', serial_number: '', 
                is_attendance_device: false, linked_machine_id: null,
                ip_address: '', port: 80 
            });
        }
    }, [editingDevice, isOpen, machines]); // Added 'machines' dependency

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                ip_address: form.ip_address === '' ? null : form.ip_address,
                linked_machine_id: form.linked_machine_id || null
            };

            if (editingDevice && editingDevice.id) {
                await API.updateDevice(editingDevice.id, payload);
                alert("Device Updated!");
            } else {
                await API.createDevice(payload);
                alert("Device Saved!");
            }
            onSuccess();
            onClose();
        } catch (e) {
            alert("Error saving device.");
            console.error(e);
        }
    };

    if (!isOpen) return null;

    // FILTER LOGIC:
    // 1. Machine has NO device (biometric_device is null)
    // 2. OR Machine is ALREADY linked to THIS device (editingDevice.id)
    const availableMachines = machines.filter(m => 
        !m.biometric_device || 
        (editingDevice && m.biometric_device === editingDevice.id)
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-xl w-[450px] shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">{editingDevice ? 'Edit Device' : 'Add Device'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Device Name</label>
                        <input required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.name} 
                            onChange={e => setForm({ ...form, name: e.target.value })} 
                            placeholder="e.g. Main Entrance" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Serial Number</label>
                        <input required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                            value={form.serial_number} 
                            onChange={e => setForm({ ...form, serial_number: e.target.value })} 
                            placeholder="e.g. CLH825..." 
                        />
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <label className="flex items-center gap-2 mb-3 cursor-pointer">
                            <input type="checkbox" 
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={form.is_attendance_device} 
                                onChange={e => setForm({ ...form, is_attendance_device: e.target.checked })} 
                            />
                            <span className="font-bold text-gray-700 text-sm">Attendance Device</span>
                        </label>
                        
                        <div className={`transition-all ${form.is_attendance_device ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                                <FiLink /> Link to Machine
                            </label>
                            <select className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                value={form.linked_machine_id || ''} // Use empty string for null to match option value
                                onChange={e => setForm({ ...form, linked_machine_id: e.target.value ? Number(e.target.value) : null })}
                            >
                                <option value="">-- No Machine Link --</option>
                                {availableMachines.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} {m.department_name ? `(${m.department_name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* --- NEW: ENROLLMENT CHECKBOX --- */}
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" 
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                checked={form.is_enrollment_device} 
                                onChange={e => setForm({ ...form, is_enrollment_device: e.target.checked })} 
                            />
                            <span className="font-bold text-gray-700 text-sm">Dojo Enrollment Device</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-6">
                            Used for enrolling new employees (Face/Finger).
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200">
                            {editingDevice ? 'Update Device' : 'Save Device'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDeviceModal;

// import React, { useState, useEffect } from 'react';
// import { FiX, FiLink } from 'react-icons/fi';
// import type { BiometricDevice, Machine } from '../types';
// import * as API from '../api';

// interface Props {
//     isOpen: boolean;
//     onClose: () => void;
//     onSuccess: () => void;
//     machines: Machine[];
//     editingDevice?: BiometricDevice | null; // New Prop
// }

// const AddDeviceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, machines, editingDevice }) => {
//     const [form, setForm] = useState<Partial<BiometricDevice>>({
//         name: '', ip_address: '192.168.1.', serial_number: '', is_attendance_device: false, linked_machine_id: undefined
//     });

//     // Populate form when editingDevice changes
//     useEffect(() => {
//         if (editingDevice) {
//             setForm({
//                 ...editingDevice,
//                 // Ensure we send the ID if it exists, otherwise undefined to unlink
//                 linked_machine_id: editingDevice.linked_machine_id 
//             });
//         } else {
//             // Reset for Add Mode
//             setForm({ name: '', ip_address: '192.168.1.', serial_number: '', is_attendance_device: false, linked_machine_id: undefined });
//         }
//     }, [editingDevice, isOpen]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             if (editingDevice && editingDevice.id) {
//                 await API.updateDevice(editingDevice.id, form); // Update
//                 alert("Device Updated!");
//             } else {
//                 await API.createDevice(form); // Create
//                 alert("Device Saved!");
//             }
//             onSuccess();
//             onClose();
//         } catch (e) {
//             alert("Error saving device. Check console.");
//             console.error(e);
//         }
//     };

//     if (!isOpen) return null;

//     // Filter available machines + The one currently linked to THIS device (so we don't hide it from itself)
//     const availableMachines = machines.filter(m => 
//         !m.biometric_device || (editingDevice && m.biometric_device === editingDevice.id)
//     );

//     return (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
//             <div className="bg-white p-6 rounded-xl w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200">
//                 <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-xl font-bold text-gray-800">{editingDevice ? 'Edit Device' : 'Add Device'}</h3>
//                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
//                 </div>
                
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-bold mb-1">Device Name</label>
//                         <input required className="w-full p-2 border rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Gate" />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-bold mb-1">IP Address</label>
//                             <input required className="w-full p-2 border rounded" value={form.ip_address} onChange={e => setForm({ ...form, ip_address: e.target.value })} />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-bold mb-1">Serial Number</label>
//                             <input required className="w-full p-2 border rounded" value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} placeholder="e.g. CLH..." />
//                         </div>
//                     </div>

//                     <div className="bg-gray-50 p-3 rounded-lg border">
//                         <label className="flex items-center gap-2 mb-2">
//                             <input type="checkbox" checked={form.is_attendance_device} onChange={e => setForm({ ...form, is_attendance_device: e.target.checked })} />
//                             <span className="font-bold text-gray-700">Attendance Device?</span>
//                         </label>
//                         <p className="text-xs text-gray-500 mb-3">Syncs ALL employees automatically if checked.</p>

//                         <label className="block text-sm font-bold mb-1 flex items-center gap-2">
//                             <FiLink /> Link to Machine:
//                         </label>
                        
//                         <select className="w-full p-2 border rounded bg-white"
//                             value={form.linked_machine_id || ''}
//                             onChange={e => setForm({ ...form, linked_machine_id: e.target.value ? Number(e.target.value) : undefined })}
//                             disabled={!!form.is_attendance_device}
//                         >
//                             <option value="">-- No Link (General) --</option>
//                             {availableMachines.map(m => (
//                                 <option key={m.id} value={m.id}>
//                                     {m.name} {m.department_name ? `(${m.department_name})` : ''}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="flex justify-end gap-2 mt-4">
//                         <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
//                         <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingDevice ? 'Update' : 'Save'}</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AddDeviceModal;