import React, { useEffect, useState } from 'react';
import { FiCpu, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import * as API from '../api';
import type { MatrixData } from '../types'; // Ensure you export this interface

// Helper to color-code MSIL Levels
const getLevelColor = (level: string) => {
    const l = level.toUpperCase();
    if (l.includes('L4')) return 'bg-purple-100 text-purple-800 border-purple-200'; // Expert
    if (l.includes('L3')) return 'bg-green-100 text-green-800 border-green-200';   // Independent
    if (l.includes('L2')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Under Observation
    return 'bg-red-100 text-red-800 border-red-200'; // Trainee (L1)
};

const ManMachineMatrix: React.FC = () => {
    const [matrix, setMatrix] = useState<MatrixData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await API.getManMachineMatrix();
                setMatrix(data);
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Matrix...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiCpu className="text-blue-600"/> Man-Machine Skill Matrix
                </h2>
                <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-100 rounded">L4: Expert</span>
                    <span className="px-2 py-1 bg-green-100 rounded">L3: Independent</span>
                    <span className="px-2 py-1 bg-yellow-100 rounded">L2: Support</span>
                    <span className="px-2 py-1 bg-red-100 rounded">L1: Trainee</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {matrix.map(machine => (
                    <div key={machine.machine_id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        
                        {/* Machine Header */}
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{machine.machine_name}</h3>
                                <p className="text-xs text-gray-500 font-mono">{machine.process_name} • {machine.device_sn}</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg border shadow-sm text-center min-w-[60px]">
                                <span className="block text-xl font-bold text-blue-600">{machine.operators.length}</span>
                                <span className="text-[10px] text-gray-400 uppercase">Qualified</span>
                            </div>
                        </div>

                        {/* Operators List */}
                        <div className="p-4 flex-1 flex flex-col gap-3">
                            {machine.operators.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-4">No qualified operators found.</p>
                            ) : (
                                machine.operators.map(op => (
                                    <div key={op.emp_id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${op.is_synced ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                {op.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 leading-none">{op.name}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">{op.emp_id}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Skill Level Badge */}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getLevelColor(op.level)}`}>
                                                {op.level}
                                            </span>

                                            {/* Interlock Status (Synced or Not) */}
                                            {op.is_synced ? (
                                                <div className="text-green-500" title="Active on Machine"><FiCheckCircle /></div>
                                            ) : (
                                                <div className="text-gray-300" title="Not Synced"><FiXCircle /></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Footer Stats */}
                        <div className="bg-gray-50 p-2 text-center text-[10px] text-gray-400 border-t">
                            {machine.operators.filter(o => o.is_synced).length} Active Operators
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManMachineMatrix;