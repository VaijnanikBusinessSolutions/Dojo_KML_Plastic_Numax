import React, { useEffect, useState } from "react";
import { FiRefreshCw, FiPlus, FiActivity, FiAlertCircle, FiUploadCloud, FiUser, FiServer, FiCheck } from 'react-icons/fi';
import { MdFace } from 'react-icons/md';
import * as API from './api';
import type { BioUser, BiometricDevice, AttendanceLog, Machine } from './types';

// Import our modular components
import AddDeviceModal from './components/AddDeviceModal';
import DeviceCard from './components/DeviceCard';
import EmployeeTable from './components/EmployeeTable';
import EnrollModal from './components/EnrollModal';
import MachineActivityChart from './components/MachineActivityChart';
import OperatorHistory from "./components/Operatorhistory";

const EasyTimeDashboard: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState<'overview' | 'machines' | 'history' | 'employees'>('overview');
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Data
    const [devices, setDevices] = useState<BiometricDevice[]>([]);
    const [users, setUsers] = useState<BioUser[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);

    // Modals
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null);
    
    const [enrollModal, setEnrollModal] = useState<{ 
        type: 'face'|'finger'|'sync', 
        userId: number, 
        validDevices: BiometricDevice[] 
    } | null>(null);

    // Form for Developer Quick Add
    const [quickAddForm, setQuickAddForm] = useState({ id: "", name: "" });

    // --- AUTHENTICATION & ROLE CHECK ---
    // We get the user object from LocalStorage (saved during Login)
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        try {
            const authStr = localStorage.getItem('auth'); // Assuming you save 'user' object here on login
            console.log('authStr', authStr);
            if (authStr) {
                const authData = JSON.parse(authStr);
                // Extract user object from the auth data structure
                const user = authData.user; 
                
                if (user && user.role) {
                    const role = user.role;
                    console.log("Current User Role:", role); // Debugging

                    // Strict Case-Sensitive Check
                    // if (role === 'Developer' || role === 'admin') {
                    if (role === 'Developer') {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                    }
                }
            } else {
                console.warn("No auth data found in localStorage");
                setIsAuthorized(false);
            }
        } catch (e) {
            console.error("Auth check failed", e);
            setIsAuthorized(false);
        }
    }, []);

    // --- DATA LOADING ---
    const loadData = async () => {
        setLoading(true);
        try {
            const [d, u, m, l] = await Promise.all([
                API.getDevices(), 
                API.getBioUsers(), 
                API.getMachines(), 
                API.getLogs()
            ]);
            setDevices(d);
            setUsers(u);
            setMachines(m);
            setLogs(l);
        } catch (e) { 
            console.error("Failed to load dashboard data", e); 
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const refreshData = () => setRefreshTrigger(prev => prev + 1);

    // --- HANDLERS ---

    // 1. Device Management
    const handleAddDevice = () => {
        setEditingDevice(null); 
        setIsDeviceModalOpen(true);
    };

    const handleEditDevice = (device: BiometricDevice) => {
        setEditingDevice(device); 
        setIsDeviceModalOpen(true);
    };

    const handleDeleteDevice = async (id: number) => {
        if (!confirm("Are you sure? Deleting this device will unlink any connected machines.")) return;
        try {
            await API.deleteDevice(id);
            refreshData(); 
        } catch (e) {
            alert("Failed to delete device.");
        }
    };

    // 2. Smart Enrollment Action
    const handleEnrollAction = async (type: 'face' | 'finger' | 'sync', user: BioUser) => {
        
        // A. Find which devices this user is synced to
        // A. Get devices the user is ALREADY synced to
        const syncedNames = (user as any).enrolled_devices || [];
        let validDevices = devices.filter(d => syncedNames.includes(d.name));

        // --- FIX START: ALWAYS INCLUDE ENROLLMENT DEVICES ---
        // This guarantees the Dojo Guru can enroll anyone, even new users.
        const enrollmentDevices = devices.filter(d => d.is_enrollment_device);
        
        enrollmentDevices.forEach(ed => {
            // Only add if it's not already in the list to avoid duplicates
            if (!validDevices.find(vd => vd.id === ed.id)) {
                validDevices.push(ed);
            }
        });
        // --- FIX END ----------------------------------------

        // Fallbacks
        if (validDevices.length === 0) validDevices = devices.filter(d => d.is_attendance_device);
        if (validDevices.length === 0) validDevices = devices;

        // B. Auto-Execute if single target (and not fingerprint)
        if (validDevices.length === 1 && type !== 'finger') {
            const target = validDevices[0];
            if(!confirm(`Auto-connect to ${target.name}?`)) return; 

            try {
                let res;
                if (type === 'face') res = await API.enrollFace(user.id, target.id);
                if (type === 'sync') res = await API.syncToDevice(user.id, target.id);

                const serverMsg = res.result?.Message || res.message || "Success";
                // alert(`✅ ${target.name}: ${res.result?.Message || res.message || "Success"}`);
                alert(`✅ ${target.name}: ${serverMsg}`);
                return; 
            } catch (e) {
                alert("Auto-Command Failed. Opening manual selection...");
            }
        } 
        
        // C. Open Modal
        setEnrollModal({ type, userId: user.id, validDevices });
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Are you sure? This will remove the user from Dojo and attempt to delete them from EasyTimePro.")) return;
        try {
            await API.deleteBioUser(id);
            refreshData();
        } catch (e) {
            alert("Failed to delete user.");
        }
    };
    
    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await API.addBioUser({ employeeid: quickAddForm.id, first_name: quickAddForm.name });
        setQuickAddForm({ id: "", name: "" });
        loadData();
    };

    const handleImportUsers = async () => {
        setLoading(true);
        try {
            const res = await API.syncUsersFromDevice();
            alert(res.message);
            if(res.warnings && res.warnings.length > 0) {
                alert("⚠️ Warnings:\n" + res.warnings.join("\n"));
            }
            refreshData(); 
        } catch (e) {
            alert("Import Failed");
        }
        setLoading(false);
    };



    
    // New Handler for Safe Revoke
    const handleRevokeAccess = async (id: number) => {
        if (!confirm("Confirm Revoke? This will remove machine access but keep the user on the EasyTime server (Main Gate access remains).")) return;
        
        try {
            const res = await API.revokeAccess(id);
            alert(res.message || "Access Revoked Successfully");
            refreshData(); 
        } catch (e) {
            alert("Failed to revoke access.");
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
            
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FiActivity className="text-blue-600"/> Biometric Control Center
                </h1>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['overview', 'machines', 'history', 'employees'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)} 
                                className={`px-4 py-2 rounded-md font-bold text-sm capitalize transition-all ${activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <button onClick={refreshData} className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Refresh Data">
                        <FiRefreshCw className={loading ? "animate-spin" : ""} size={18} />
                    </button>
                </div>
            </div>

            {/* --- TAB 1: OVERVIEW (Redesigned) --- */}
             {activeTab === 'overview' && (
                <div className="animate-in fade-in duration-300 space-y-8">
                    
                    {/* 1. TOP STATS ROW (Full Width) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-blue-500 flex items-center justify-between">
                            <div>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Staff</span>
                                <span className="text-3xl font-bold text-gray-800 block mt-1">{users.length}</span>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><FiUser size={24}/></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-green-500 flex items-center justify-between">
                            <div>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Devices</span>
                                <span className="text-3xl font-bold text-gray-800 block mt-1">{devices.length}</span>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-full"><FiServer size={24}/></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-purple-500 flex items-center justify-between">
                            <div>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Today's Punches</span>
                                <span className="text-3xl font-bold text-gray-800 block mt-1">{logs.length}</span>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><FiActivity size={24}/></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-orange-500 flex items-center justify-between">
                            <div>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Sync Status</span>
                                <span className="text-sm font-bold text-green-600 block mt-1">Healthy</span>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><FiCheck size={24}/></div>
                        </div>
                    </div>

                    {/* 2. MAIN CONTENT GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LEFT COLUMN (2/3): Charts & Devices */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* A. Activity Chart (CSS Only - No extra library needed) */}
                            <MachineActivityChart logs={logs} devices={devices} />

                            {/* B. Devices List */}
                            {isAuthorized && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-700">Connected Attendance Devices</h3>
                                    <button onClick={handleAddDevice} className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
                                        <FiPlus/> Add New
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {devices.filter(d => d.is_attendance_device).map(dev => (
                                        <DeviceCard 
                                            key={dev.id} 
                                            device={dev} 
                                            isAuthorized={isAuthorized} // Pass Permission
                                            onEdit={handleEditDevice} 
                                            onDelete={handleDeleteDevice} 
                                        />
                                    ))}
                                    {devices.filter(d => d.is_attendance_device).length === 0 && (
                                        <div className="col-span-2 p-8 text-center bg-white border-2 border-dashed rounded-xl text-gray-400">
                                            No devices found.
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (1/3): Logs & Quick Actions */}
                        <div className="space-y-8">
                            
                            {/* C. Quick Actions */}
                            {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-4">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={refreshData} className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 flex flex-col items-center gap-2">
                                        <FiRefreshCw size={20}/> Refresh All
                                    </button>
                                    <button onClick={() => setIsDeviceModalOpen(true)} className="p-3 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 flex flex-col items-center gap-2">
                                        <FiPlus size={20}/> Add Device
                                    </button>
                                </div>
                            </div> */}

                            {/* D. Live Logs Feed */}
                            <div className="bg-white rounded-xl shadow border border-gray-100 h-[600px] flex flex-col">
                                <div className="p-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700">Live Feed</h3>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Live</span>
                                </div>
                                <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
                                    {logs.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                            <FiActivity size={32} className="mb-2 opacity-20"/>
                                            <p>No activity today</p>
                                        </div>
                                    ) : (
                                        logs.map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 text-blue-600 p-2 rounded-full"><MdFace/></div>
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-800">{log.employee_code || log.employee_name}</div>
                                                        <div className="text-[10px] text-gray-400 uppercase">{log.employee_name}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {log.datetime ? log.datetime.split(' ')[1] : '--:--'}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 1: OVERVIEW --- */}
            {/* {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                    
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Attendance Devices</h2>
                            {isAuthorized && (
                                <button onClick={handleAddDevice} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md font-medium">
                                    <FiPlus /> Add Device
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {devices.filter(d => d.is_attendance_device).map(dev => (
                                <DeviceCard 
                                    key={dev.id} 
                                    device={dev} 
                                    isAuthorized={isAuthorized} // Pass Permission
                                    onEdit={handleEditDevice} 
                                    onDelete={handleDeleteDevice} 
                                />
                            ))}
                            {devices.filter(d => d.is_attendance_device).length === 0 && (
                                <div className="col-span-2 p-8 text-center bg-white border-2 border-dashed border-gray-200 rounded-xl">
                                    No attendance devices found.
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <span className="text-2xl font-bold text-blue-900">{users.length}</span>
                                <span className="text-xs uppercase font-bold text-blue-600 block">Total Employees</span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <span className="text-2xl font-bold text-green-900">{devices.length}</span>
                                <span className="text-xs uppercase font-bold text-green-600 block">Active Devices</span>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <span className="text-2xl font-bold text-purple-900">{logs.length}</span>
                                <span className="text-xs uppercase font-bold text-purple-600 block">Logs Today</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow border border-gray-100 h-[600px] flex flex-col">
                        <div className="p-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Live Feed</h3>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Live</span>
                        </div>
                        <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <FiActivity size={32} className="mb-2 opacity-20"/>
                                    <p>No activity today</p>
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={`flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all ${log.device_name?.includes('Machine') ? 'border-purple-100' : 'border-gray-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${log.device_name?.includes('Machine') ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                <MdFace/>
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-800">{log.employee_code || log.employee_name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">{log.device_name}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {log.datetime ? log.datetime.split(' ')[1] : '--:--'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )} */}

            {/* --- TAB 2: MACHINES --- */}
            {activeTab === 'machines' && (
                <div className="animate-in fade-in duration-300">
                    
                    {/* <div className="mb-8">
                        <MachineActivityChart logs={logs} devices={devices} />
                    </div> */}

                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-700">Machine Control Units</h3>
                        {/* HIDE ADD BUTTON IF NOT AUTHORIZED */}
                        {isAuthorized && (
                            <button onClick={handleAddDevice} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md">
                                <FiPlus /> Add Machine Device
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.filter(d => !d.is_attendance_device).map(dev => (
                            <DeviceCard 
                                key={dev.id} 
                                device={dev} 
                                isAuthorized={isAuthorized} // Pass Permission
                                onEdit={handleEditDevice} 
                                onDelete={handleDeleteDevice} 
                            />
                        ))}
                    </div>
                </div>
            )}

            
            {/* --- TAB 3: HISTORY --- */}
            {activeTab === 'history' && (
                <div className="animate-in fade-in duration-300">
                    <OperatorHistory  
                        isAuthorized={isAuthorized} 
                        // REMOVED: logs={logs} 
                        // REMOVED: devices={devices}
                        // The component now handles its own data fetching!
                    />
                </div>
            )}

            {/* --- TAB 3: EMPLOYEES --- */}
            {activeTab === 'employees' && (
                <div className="animate-in fade-in duration-300 space-y-6">
                      
                    {/* Developer Toolbar - ONLY VISIBLE IF AUTHORIZED */}
                    {isAuthorized && (
                        <>
                            <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex items-center gap-4">
                                <span className="text-yellow-800 font-bold text-xs uppercase flex items-center gap-1"><FiAlertCircle/> Admin Mode</span>
                                <input placeholder="ID" value={quickAddForm.id} onChange={e=>setQuickAddForm({...quickAddForm, id: e.target.value})} className="p-1 border rounded text-sm"/>
                                <input placeholder="Name" value={quickAddForm.name} onChange={e=>setQuickAddForm({...quickAddForm, name: e.target.value})} className="p-1 border rounded text-sm"/>
                                <button onClick={handleQuickAdd} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-bold">Quick Add</button>
                            </div>

                            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                <h2 className="text-lg font-bold text-gray-700">Employee Database</h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleImportUsers} 
                                        className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 shadow text-sm"
                                    >
                                        <FiUploadCloud className="rotate-180" /> Sync Device → Dojo
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <EmployeeTable 
                        users={users} 
                        devices={devices}
                        isAuthorized={isAuthorized} // Pass Permission
                        onAction={handleEnrollAction} 
                        onDelete={handleDeleteUser} 
                        onRevoke={handleRevokeAccess} // <--- Pass the new handler
                        onRefresh={loadData} 
                    />
                </div>
            )}

            {/* --- MODALS --- */}
            <AddDeviceModal 
                isOpen={isDeviceModalOpen} 
                onClose={() => setIsDeviceModalOpen(false)} 
                onSuccess={refreshData}
                machines={machines}
                editingDevice={editingDevice}
            />

            {enrollModal && (
                <EnrollModal 
                    isOpen={!!enrollModal}
                    onClose={() => setEnrollModal(null)}
                    type={enrollModal.type}
                    userId={enrollModal.userId}
                    devices={enrollModal.validDevices} 
                />
            )}

        </div>
    );
};

export default EasyTimeDashboard;

// import React, { useEffect, useState } from "react";
// import { FiRefreshCw, FiPlus, FiActivity, FiAlertCircle, FiUploadCloud, FiUser, FiServer, FiCheck } from 'react-icons/fi';
// import { MdFace } from 'react-icons/md';
// import * as API from './api';
// import type { BioUser, BiometricDevice, AttendanceLog, Machine } from './types';

// // Import our modular components
// import AddDeviceModal from './components/AddDeviceModal';
// import DeviceCard from './components/DeviceCard';
// import EmployeeTable from './components/EmployeeTable';
// import EnrollModal from './components/EnrollModal';
// import MachineActivityChart from './components/MachineActivityChart';
// // import ManMachineMatrix from "./components/ManMachineMatrix";

// const EasyTimeDashboard: React.FC = () => {
//     // --- STATE MANAGEMENT ---
//     const [activeTab, setActiveTab] = useState<'overview' | 'machines' | 'employees'>('overview');
//     // const [activeTab, setActiveTab] = useState<'overview' | 'machines' | 'matrix' | 'employees'>('overview');
//     const [loading, setLoading] = useState(false);
//     const [refreshTrigger, setRefreshTrigger] = useState(0);

//     // Data
//     const [devices, setDevices] = useState<BiometricDevice[]>([]);
//     const [users, setUsers] = useState<BioUser[]>([]);
//     const [logs, setLogs] = useState<AttendanceLog[]>([]);
//     const [machines, setMachines] = useState<Machine[]>([]);

//     console.log('biometric data', devices, users, logs, machines);

//     // Modals
//     const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
//     const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null);
//     // const [enrollModal, setEnrollModal] = useState<{ type: 'face'|'finger'|'sync', userId: number } | null>(null);
//     const [enrollModal, setEnrollModal] = useState<{ 
//         type: 'face'|'finger'|'sync', 
//         userId: number, 
//         validDevices: BiometricDevice[] 
//     } | null>(null);

//     // Form for Developer Quick Add
//     const [quickAddForm, setQuickAddForm] = useState({ id: "", name: "" });

    // // --- AUTHENTICATION & ROLE CHECK ---
    // // We get the user object from LocalStorage (saved during Login)
    // const [isAuthorized, setIsAuthorized] = useState(false);

    // useEffect(() => {
    //     try {
    //         const authStr = localStorage.getItem('auth'); // Assuming you save 'user' object here on login
    //         console.log('authStr', authStr);
    //         if (authStr) {
    //             const authData = JSON.parse(authStr);
    //             // Extract user object from the auth data structure
    //             const user = authData.user; 
                
    //             if (user && user.role) {
    //                 const role = user.role;
    //                 console.log("Current User Role:", role); // Debugging

    //                 // Strict Case-Sensitive Check
    //                 // if (role === 'Developer' || role === 'admin') {
    //                 if (role === 'Developer') {
    //                     setIsAuthorized(true);
    //                 } else {
    //                     setIsAuthorized(false);
    //                 }
    //             }
    //         } else {
    //             console.warn("No auth data found in localStorage");
    //             setIsAuthorized(false);
    //         }
    //     } catch (e) {
    //         console.error("Auth check failed", e);
    //         setIsAuthorized(false);
    //     }
    // }, []);

//     // --- DATA LOADING ---
//     const loadData = async () => {
//         setLoading(true);
//         try {
//             const [d, u, m, l] = await Promise.all([
//                 API.getDevices(), 
//                 API.getBioUsers(), 
//                 API.getMachines(), 
//                 API.getLogs()
//             ]);
//             setDevices(d);
//             setUsers(u);
//             setMachines(m);
//             setLogs(l);
//         } catch (e) { 
//             console.error("Failed to load dashboard data", e); 
//         }
//         setLoading(false);
//     };

//     useEffect(() => {
//         loadData();
//     }, [refreshTrigger]);

//     const refreshData = () => setRefreshTrigger(prev => prev + 1);

//     // Helper: Developer Mode Check (safely access property)
   // // const isDevMode = users.length > 0 ? (users[0] as any).dev_mode : false;

//     // --- HANDLERS ---

//     // 1. Device Management
//     const handleAddDevice = () => {
//         setEditingDevice(null); // Clear previous edit data
//         setIsDeviceModalOpen(true);
//     };

//     const handleEditDevice = (device: BiometricDevice) => {
//         setEditingDevice(device); // Load device into modal
//         setIsDeviceModalOpen(true);
//     };

//     const handleDeleteDevice = async (id: number) => {
//         if (!confirm("Are you sure? Deleting this device will unlink any connected machines.")) return;
//         try {
//             await API.deleteDevice(id);
//             refreshData(); // Reload to remove from list
//         } catch (e) {
//             alert("Failed to delete device.");
//         }
//     };

//     // 2. Enrollment
//     // const handleEnrollAction = (type: 'face' | 'finger' | 'sync', userId: number) => {
//     //     setEnrollModal({ type, userId });
//     // };
//     // 2. Smart Enrollment Action
//     // Note: We now expect the full 'user' object, not just ID
//     const handleEnrollAction = async (type: 'face' | 'finger' | 'sync', user: BioUser) => {
        
//         // A. Find which devices this user is synced to
//         // (Assumes serializer sends 'enrolled_devices' list of names)
//         const syncedNames = (user as any).enrolled_devices || [];
        
//         // B. Filter the main device list to find matches
//         let validDevices = devices.filter(d => syncedNames.includes(d.name));

//         // Fallback 1: If not synced anywhere, use Attendance Devices
//         if (validDevices.length === 0) {
//             validDevices = devices.filter(d => d.is_attendance_device);
//         }
//         // Fallback 2: If no attendance devices, use ALL devices
//         if (validDevices.length === 0) {
//             validDevices = devices;
//         }

//         // C. DECISION TIME
//         // If there is exactly ONE target and it's not Fingerprint (which needs index selection),
//         // we execute immediately without a popup.
//         if (validDevices.length === 1 && type !== 'finger') {
//             const target = validDevices[0];
//             if(!confirm(`Auto-connect to ${target.name}?`)) return; // Optional safety confirmation

//             try {
//                 let res;
//                 if (type === 'face') res = await API.enrollFace(user.id, target.id);
//                 if (type === 'sync') res = await API.syncToDevice(user.id, target.id);
                
//                 alert(`✅ ${target.name}: ${res.result?.Message || res.message || "Success"}`);
//                 return; // Done, no modal needed
//             } catch (e) {
//                 alert("Auto-Command Failed. Opening manual selection...");
//             }
//         } 
        
//         // D. If we can't auto-decide, Open Modal with the filtered list
//         setEnrollModal({ type, userId: user.id, validDevices });
//     };

//     // New Handler for User Deletion
//     const handleDeleteUser = async (id: number) => {
//         if (!confirm("Are you sure? This will remove the user from Dojo and attempt to delete them from EasyTimePro.")) return;
        
//         try {
//             await API.deleteBioUser(id);
//             refreshData(); // Reload the list
//         } catch (e) {
//             alert("Failed to delete user. Check console for details.");
//             console.error(e);
//         }
//     };
    
//     const handleQuickAdd = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if(!isDevMode) return; 
//         await API.addBioUser({ employeeid: quickAddForm.id, first_name: quickAddForm.name });
//         setQuickAddForm({ id: "", name: "" });
//         loadData();
//     };

//     const handleImportUsers = async () => {
//         setLoading(true);
//         try {
//             const res = await API.syncUsersFromDevice();
//             alert(res.message);
//             refreshData(); // Reload table to see new users
//         } catch (e) {
//             alert("Import Failed");
//         }
//         setLoading(false);
//     };


//     return (
//         <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
            
//             {/* --- HEADER --- */}
//             <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
//                 <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
//                     <FiActivity className="text-blue-600"/> Biometric Control Center
//                 </h1>
                
//                 <div className="flex items-center gap-3">
//                     <div className="flex bg-gray-100 p-1 rounded-lg">
//                         {['overview', 'machines',  'employees'].map(tab => (
//                         // {['overview', 'machines', 'matrix',  'employees'].map(tab => (
//                             <button 
//                                 key={tab}
//                                 onClick={() => setActiveTab(tab as any)} 
//                                 className={`px-4 py-2 rounded-md font-bold text-sm capitalize transition-all ${activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
//                             >
//                                 {tab}
//                             </button>
//                         ))}
//                     </div>
                    
//                     <button onClick={refreshData} className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Refresh Data">
//                         <FiRefreshCw className={loading ? "animate-spin" : ""} size={18} />
//                     </button>
//                 </div>
//             </div>


//             {/* --- TAB 1: OVERVIEW (Redesigned) --- */}
//             {activeTab === 'overview' && (
//                 <div className="animate-in fade-in duration-300 space-y-8">
                    
//                     {/* 1. TOP STATS ROW (Full Width) */}
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                         <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-blue-500 flex items-center justify-between">
//                             <div>
//                                 <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Staff</span>
//                                 <span className="text-3xl font-bold text-gray-800 block mt-1">{users.length}</span>
//                             </div>
//                             <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><FiUser size={24}/></div>
//                         </div>
//                         <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-green-500 flex items-center justify-between">
//                             <div>
//                                 <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Devices</span>
//                                 <span className="text-3xl font-bold text-gray-800 block mt-1">{devices.length}</span>
//                             </div>
//                             <div className="p-3 bg-green-50 text-green-600 rounded-full"><FiServer size={24}/></div>
//                         </div>
//                         <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-purple-500 flex items-center justify-between">
//                             <div>
//                                 <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Today's Punches</span>
//                                 <span className="text-3xl font-bold text-gray-800 block mt-1">{logs.length}</span>
//                             </div>
//                             <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><FiActivity size={24}/></div>
//                         </div>
//                         <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-orange-500 flex items-center justify-between">
//                             <div>
//                                 <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Sync Status</span>
//                                 <span className="text-sm font-bold text-green-600 block mt-1">Healthy</span>
//                             </div>
//                             <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><FiCheck size={24}/></div>
//                         </div>
//                     </div>

//                     {/* 2. MAIN CONTENT GRID */}
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
//                         {/* LEFT COLUMN (2/3): Charts & Devices */}
//                         <div className="lg:col-span-2 space-y-8">
                            
//                             {/* A. Activity Chart (CSS Only - No extra library needed) */}
//                             <MachineActivityChart logs={logs} devices={devices} />

//                             {/* B. Devices List */}
//                             <div>
//                                 <div className="flex justify-between items-center mb-4">
//                                     <h3 className="text-lg font-bold text-gray-700">Connected Attendance Devices</h3>
//                                     <button onClick={handleAddDevice} className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
//                                         <FiPlus/> Add New
//                                     </button>
//                                 </div>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {devices.filter(d => d.is_attendance_device).map(dev => (
//                                         <DeviceCard 
//                                             key={dev.id} 
//                                             device={dev} 
//                                             onEdit={handleEditDevice} 
//                                             onDelete={handleDeleteDevice} 
//                                         />
//                                     ))}
//                                     {devices.filter(d => d.is_attendance_device).length === 0 && (
//                                         <div className="col-span-2 p-8 text-center bg-white border-2 border-dashed rounded-xl text-gray-400">
//                                             No devices found.
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* RIGHT COLUMN (1/3): Logs & Quick Actions */}
//                         <div className="space-y-8">
                            
//                             {/* C. Quick Actions */}
//                             {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                                 <h4 className="font-bold text-gray-700 mb-4">Quick Actions</h4>
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <button onClick={refreshData} className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 flex flex-col items-center gap-2">
//                                         <FiRefreshCw size={20}/> Refresh All
//                                     </button>
//                                     <button onClick={() => setIsDeviceModalOpen(true)} className="p-3 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 flex flex-col items-center gap-2">
//                                         <FiPlus size={20}/> Add Device
//                                     </button>
//                                 </div>
//                             </div> */}

//                             {/* D. Live Logs Feed */}
//                             <div className="bg-white rounded-xl shadow border border-gray-100 h-[600px] flex flex-col">
//                                 <div className="p-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
//                                     <h3 className="font-bold text-gray-700">Live Feed</h3>
//                                     <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Live</span>
//                                 </div>
//                                 <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
//                                     {logs.length === 0 ? (
//                                         <div className="h-full flex flex-col items-center justify-center text-gray-400">
//                                             <FiActivity size={32} className="mb-2 opacity-20"/>
//                                             <p>No activity today</p>
//                                         </div>
//                                     ) : (
//                                         logs.map((log, i) => (
//                                             <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all">
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="bg-blue-50 text-blue-600 p-2 rounded-full"><MdFace/></div>
//                                                     <div>
//                                                         <div className="font-bold text-sm text-gray-800">{log.employee_code || log.employee_name}</div>
//                                                         <div className="text-[10px] text-gray-400 uppercase">{log.employee_name}</div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                                                     {log.datetime ? log.datetime.split(' ')[1] : '--:--'}
//                                                 </div>
//                                             </div>
//                                         ))
//                                     )}
//                                 </div>
//                             </div>

//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* --- TAB 2: MACHINES (Smart Manufacturing) --- */}
//             {activeTab === 'machines' && (
//                 <div className="animate-in fade-in duration-300">
//                     <div className="flex justify-between items-center mb-6">
//                         <h3 className="text-xl font-bold text-gray-700">Machine Control Units</h3>
//                         <button onClick={handleAddDevice} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md">
//                             <FiPlus /> Add Machine Device
//                         </button>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {devices.filter(d => !d.is_attendance_device).map(dev => (
//                             <DeviceCard 
//                                 key={dev.id} 
//                                 device={dev} 
//                                 onEdit={handleEditDevice} 
//                                 onDelete={handleDeleteDevice} 
//                             />
//                         ))}
//                         {devices.filter(d => !d.is_attendance_device).length === 0 && (
//                             <p className="col-span-3 text-center text-gray-400 py-10">No machine control devices configured.</p>
//                         )}
//                     </div>
//                 </div>
//             )}


//             {/* {activeTab === 'matrix' && <ManMachineMatrix />} */}

//             {/* --- TAB 3: EMPLOYEES (Management Table) --- */}
//             {activeTab === 'employees' && (
//                 <div className="animate-in fade-in duration-300 space-y-6">
//                      {/* Developer Quick Add */}
//                     {isDevMode && (
//                         <>
//                             <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex items-center gap-4">
//                                 <span className="text-yellow-800 font-bold text-xs uppercase flex items-center gap-1"><FiAlertCircle/></span>
//                                 <input placeholder="ID" value={quickAddForm.id} onChange={e=>setQuickAddForm({...quickAddForm, id: e.target.value})} className="p-1 border rounded text-sm"/>
//                                 <input placeholder="Name" value={quickAddForm.name} onChange={e=>setQuickAddForm({...quickAddForm, name: e.target.value})} className="p-1 border rounded text-sm"/>
//                                 <button onClick={handleQuickAdd} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-bold">Quick Add</button>
//                             </div>

//                             {/* TOOLBAR */}
//                             <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
//                                 <h2 className="text-lg font-bold text-gray-700">Employee Database</h2>
//                                 <div className="flex gap-2">
//                                     {/* IMPORT BUTTON */}
//                                     <button 
//                                         onClick={handleImportUsers} 
//                                         className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 shadow text-sm"
//                                     >
//                                         <FiUploadCloud className="rotate-180" /> Import from Device
//                                     </button>
//                                 </div>
//                             </div>
//                         </>
                        
//                     )}

                    

//                     <EmployeeTable 
//                         users={users} 
//                         isDevMode={isDevMode} 
//                         devices={devices} // <--- ADD THIS PROP
//                         onAction={handleEnrollAction} 
//                         onDelete={handleDeleteUser} 
//                         onRefresh={loadData} // <--- ADDED THIS
//                     />
//                 </div>
//             )}

//             {/* --- MODALS --- */}
            
//             {/* 1. Add/Edit Device Modal */}
//             <AddDeviceModal 
//                 isOpen={isDeviceModalOpen} 
//                 onClose={() => setIsDeviceModalOpen(false)} 
//                 onSuccess={refreshData}
//                 machines={machines}
//                 editingDevice={editingDevice}
//             />

//             {/* 2. Enrollment/Sync Modal */}
//             {enrollModal && (
//                 <EnrollModal 
//                     isOpen={!!enrollModal}
//                     onClose={() => setEnrollModal(null)}
//                     type={enrollModal.type}
//                     userId={enrollModal.userId}
//                     // devices={devices}
//                     devices={enrollModal.validDevices} // <--- NEW: Only show valid options
//                 />
//             )}

//         </div>
//     );
// };

// export default EasyTimeDashboard;