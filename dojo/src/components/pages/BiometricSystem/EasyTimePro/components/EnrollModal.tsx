import React, { useState, useEffect } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { MdFace, MdFingerprint } from 'react-icons/md';
import type { BiometricDevice } from '../types';
import * as API from '../api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    type: 'face' | 'finger' | 'sync'; // What action are we doing?
    userId: number;                   // Who are we doing it for?
    devices: BiometricDevice[];       // List of devices to choose from
}

const EnrollModal: React.FC<Props> = ({ isOpen, onClose, type, userId, devices }) => {
    console.log(devices);
    const [targetDeviceId, setTargetDeviceId] = useState<string>("");
    const [fingerIndex, setFingerIndex] = useState(6); // Default: Right Index

    // Auto-select the first device when modal opens
    useEffect(() => {
        if (devices.length > 0 && !targetDeviceId) {
            setTargetDeviceId(String(devices[0].id));
        }
    }, [devices, isOpen]);

    const handleSubmit = async () => {
        if (!targetDeviceId) return alert("Please select a device.");
        const dId = Number(targetDeviceId);

        try {
            let res;
            if (type === 'face') {
                res = await API.enrollFace(userId, dId);
            } else if (type === 'finger') {
                res = await API.enrollFinger(userId, dId, fingerIndex);
            } else if (type === 'sync') {
                res = await API.syncToDevice(userId, dId);
            }

            // EasyTime returns either 'result.Message' or just 'message'
            const msg = res.result?.Message || res.message || "Command Sent Successfully!";
            alert(msg);
            onClose();
        } catch (e) {
            alert("Command Failed. Check if device is online.");
            console.error(e);
        }
    };

    if (!isOpen) return null;

    const fingerOptions = [
        { value: 6, label: "Right Index" },
        { value: 5, label: "Right Thumb" },
        { value: 3, label: "Left Index" },
        { value: 4, label: "Left Thumb" },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <h3 className="text-xl font-bold mb-3 capitalize flex items-center gap-2 text-gray-800">
                    {type === 'face' && <MdFace className="text-blue-500" />}
                    {type === 'finger' && <MdFingerprint className="text-green-500" />}
                    {type === 'sync' && <FiUploadCloud className="text-purple-500" />}
                    {type === 'sync' ? 'Push to Device' : `Enroll ${type}`}
                </h3>

                <p className="text-sm text-gray-500 mb-4">
                    Select the device where the employee is currently standing.
                </p>

                {/* Device Selector */}
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Target Device</label>
                    <select 
                        className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={e => setTargetDeviceId(e.target.value)} 
                        value={targetDeviceId}
                    >
                        {devices.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.serial_number})</option>
                        ))}
                    </select>
                </div>

                {/* Finger Selector (Only show for Fingerprint mode) */}
                {type === 'finger' && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Finger to Enroll</label>
                        <select 
                            className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                            onChange={e => setFingerIndex(Number(e.target.value))} 
                            value={fingerIndex}
                        >
                            {fingerOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        className={`px-4 py-2 text-white rounded shadow font-bold transition-transform active:scale-95
                            ${type === 'face' ? 'bg-blue-600 hover:bg-blue-700' : 
                              type === 'finger' ? 'bg-green-600 hover:bg-green-700' : 
                              'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        Execute Command
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnrollModal;