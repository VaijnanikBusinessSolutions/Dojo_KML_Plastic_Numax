import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
    Plus, Trash2, Clock, Loader2, Repeat, Bell, Keyboard,
    FolderOpen, CheckCircle, XCircle, AlertTriangle, 
    FileSpreadsheet, FolderInput, Shield, Info, ArrowRight, 
    Folder, HardDrive, Settings, ChevronDown, ChevronUp
} from "lucide-react";

// --- TYPES ---
interface Alarm {
    id: number;
    time: string;
    label: string;
    repeat_text: string;
    enabled: boolean;
}

interface SystemSettings {
    id: number;
    excel_source_path: string;
    processed_folder_path: string;
    path_exists: boolean;
    processed_folder_exists: boolean;
    updated_at: string;
}

interface PathValidation {
    valid: boolean;
    path_exists: boolean;
    is_directory: boolean;
    processed_folder_exists: boolean;
    excel_files_count: number;
    processed_path: string;
}

const API_URL = "http://172.25.0.51:8000/set-task-time/attendance/";
const SETTINGS_URL = "http://172.25.0.51:8000/system-settings/";
const VALIDATE_URL = "http://172.25.0.51:8000/validate-path/";

const SetAttendanceTaskTime: React.FC = () => {
    const [alarms, setAlarms] = useState<Alarm[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingAlarm, setIsAddingAlarm] = useState(false); // ← Replaced isModalOpen
    
    // Settings State
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [newPath, setNewPath] = useState("");
    const [pathValidation, setPathValidation] = useState<PathValidation | null>(null);
    const [validating, setValidating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPathWarning, setShowPathWarning] = useState(false);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    // --- FETCH DATA ---
    const fetchAlarms = async () => {
        try {
            const res = await axios.get(API_URL);
            setAlarms(res.data);
        } catch (err) { 
            console.error("Fetch error", err); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await axios.get(SETTINGS_URL);
            setSettings(res.data);
            setNewPath(res.data.excel_source_path || "");
        } catch (err) {
            console.error("Settings fetch error", err);
        }
    };

    useEffect(() => { 
        fetchAlarms(); 
        fetchSettings();
    }, []);

    // --- PATH VALIDATION ---
    const validatePath = async (path: string) => {
        if (!path.trim()) {
            setPathValidation(null);
            return;
        }
        
        setValidating(true);
        try {
            const res = await axios.post(VALIDATE_URL, { path: path.trim() });
            setPathValidation(res.data);
        } catch (err) {
            setPathValidation(null);
        } finally {
            setValidating(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (newPath !== settings?.excel_source_path) {
                validatePath(newPath);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [newPath, settings?.excel_source_path]);

    // --- SAVE PATH ---
    const handleSavePath = async () => {
        if (!pathValidation?.valid) {
            alert("Please enter a valid path first.");
            return;
        }

        setSaving(true);
        try {
            const res = await axios.patch(SETTINGS_URL, { 
                excel_source_path: newPath.trim() 
            });
            
            if (res.data.success) {
                setSettings(res.data.data);
                setShowPathWarning(false);
                setExpandedStep(null);
                alert(res.data.message + (res.data.processed_folder_created ? " Processed folder was created automatically." : ""));
            }
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to save path");
        } finally {
            setSaving(false);
        }
    };

    // --- ALARM ACTIONS ---
    const toggleAlarm = async (id: number, currentState: boolean) => {
        setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !currentState } : a));
        try { 
            await axios.patch(API_URL, { id, enabled: !currentState }); 
        } catch { 
            fetchAlarms(); 
        }
    };

    const deleteAlarm = async (id: number) => {
        if (!window.confirm("Delete this schedule?")) return;
        try {
            await axios.delete(`${API_URL}?id=${id}`);
            setAlarms(prev => prev.filter(a => a.id !== id));
        } catch { 
            alert("Failed to delete"); 
        }
    };

    const handleAdd = async (time: string, label: string, days: number[]) => {
        setLoading(true);
        try {
            await axios.post(API_URL, { time, label, days });
            await fetchAlarms();
            setIsAddingAlarm(false); // ← Close add screen after save
        } catch { 
            alert("Failed to save"); 
        } finally { 
            setLoading(false); 
        }
    };

    const pathChanged = newPath.trim() !== (settings?.excel_source_path || "");

    const toggleStep = (step: number) => {
        setExpandedStep(expandedStep === step ? null : step);
    };

    return (
        <div className="flex gap-6 max-w-6xl mx-auto">
            
            {/* LEFT SIDE - SETUP INSTRUCTIONS */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <HardDrive className="w-5 h-5" />
                        Source Configuration
                    </h2>
                    <p className="text-slate-300 text-xs mt-1">
                        Configure where the system looks for Excel files
                    </p>
                </div>

                {/* Current Status */}
                {settings && (
                    <div className={`m-4 p-3 rounded-xl flex items-center gap-3 ${
                        settings.path_exists 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-amber-50 border border-amber-200'
                    }`}>
                        {settings.path_exists ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-green-800">Active Path</p>
                                    <p className="text-xs text-green-600 truncate">{settings.excel_source_path}</p>
                                </div>
                                <div className="flex gap-1">
                                    {settings.processed_folder_exists && (
                                        <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full">Processed ✓</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-800">Not Configured</p>
                                    <p className="text-xs text-amber-600">Follow the steps below</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
                    
                    {/* STEP 1 */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <button 
                            onClick={() => toggleStep(1)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-blue-500" />
                                    Create Source Folder
                                </h3>
                            </div>
                            {expandedStep === 1 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {expandedStep === 1 && (
                            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                                <p className="text-xs text-gray-600 mb-2">
                                    Create a folder on your computer where you'll place the biometric Excel files.
                                </p>
                                <code className="text-xs bg-white px-2 py-1 rounded border text-gray-700 block">
                                    C:\Users\YourName\Desktop\Biometric Data
                                </code>
                            </div>
                        )}
                    </div>

                    {/* STEP 2 */}
                    <div className="border border-orange-200 rounded-xl overflow-hidden bg-orange-50/30">
                        <button 
                            onClick={() => toggleStep(2)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-orange-50 transition-colors"
                        >
                            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">2</div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <FolderInput className="w-4 h-4 text-orange-500" />
                                    Create "Processed" Folder
                                    <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">CRITICAL</span>
                                </h3>
                            </div>
                            {expandedStep === 2 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {expandedStep === 2 && (
                            <div className="px-4 pb-4 pt-2 bg-orange-50 border-t border-orange-100">
                                <p className="text-xs text-gray-600 mb-2">
                                    Create a subfolder named exactly <strong>"Processed"</strong> inside your source folder.
                                </p>
                                <div className="bg-white rounded-lg p-2 border border-orange-200 text-xs">
                                    <div className="flex items-center gap-1">
                                        <Folder className="w-3 h-3 text-blue-500" />
                                        <span>Biometric Data</span>
                                    </div>
                                    <div className="flex items-center gap-1 ml-4 mt-1">
                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                        <Folder className="w-3 h-3 text-orange-500" />
                                        <span className="font-bold text-orange-600">Processed</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-orange-600 mt-2 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    If not created manually, system will try to create it automatically
                                </p>
                            </div>
                        )}
                    </div>

                    {/* STEP 3 */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <button 
                            onClick={() => toggleStep(3)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                                    Excel File Naming
                                </h3>
                            </div>
                            {expandedStep === 3 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {expandedStep === 3 && (
                            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                                <p className="text-xs text-gray-600 mb-2">
                                    Name files with the date. Keep <strong>ONE file</strong> at a time.
                                </p>
                                <div className="space-y-1 text-xs">
                                    <code className="bg-green-50 text-green-700 px-2 py-1 rounded block">04.12.25.xlsx ✓</code>
                                    <code className="bg-green-50 text-green-700 px-2 py-1 rounded block">4-12-2025.xlsx ✓</code>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* STEP 4 - PATH INPUT */}
                    <div className="border-2 border-green-200 rounded-xl overflow-hidden bg-green-50/30">
                        <button 
                            onClick={() => toggleStep(4)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-green-50 transition-colors"
                        >
                            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4 text-green-600" />
                                    Set Source Path
                                </h3>
                            </div>
                            {expandedStep === 4 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {expandedStep === 4 && (
                            <div className="px-4 pb-4 pt-2 bg-green-50 border-t border-green-100 space-y-3">
                                {/* Path Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newPath}
                                        onChange={(e) => {
                                            setNewPath(e.target.value);
                                            if (settings?.excel_source_path && e.target.value !== settings.excel_source_path) {
                                                setShowPathWarning(true);
                                            }
                                        }}
                                        placeholder="C:\Users\...\Biometric Data"
                                        className="w-full px-3 py-2 pr-9 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-white"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        {validating ? (
                                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                        ) : pathValidation?.valid ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : pathValidation && !pathValidation.valid ? (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        ) : null}
                                    </div>
                                </div>

                                {/* Validation Status */}
                                {pathValidation && (
                                    <div className={`p-2 rounded-lg text-xs ${
                                        pathValidation.valid 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {pathValidation.valid ? (
                                            <div className="space-y-0.5">
                                                <p className="font-medium">✓ Path valid</p>
                                                <p>Processed: {pathValidation.processed_folder_exists ? '✓' : 'Will be created'}</p>
                                                {pathValidation.excel_files_count > 0 && (
                                                    <p>📁 {pathValidation.excel_files_count} file(s) found</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p>✗ {!pathValidation.path_exists ? "Path not found" : "Not a folder"}</p>
                                        )}
                                    </div>
                                )}

                                {/* Warning */}
                                {showPathWarning && pathChanged && (
                                    <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-amber-800">⚠️ Confirm Path Change</p>
                                                <p className="text-[10px] text-amber-700 mt-1">
                                                    All scheduled tasks will use the new path.
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            setNewPath(settings?.excel_source_path || "");
                                                            setShowPathWarning(false);
                                                            setPathValidation(null);
                                                        }}
                                                        className="px-3 py-1.5 text-xs bg-white text-gray-700 rounded-lg hover:bg-gray-100 border"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSavePath}
                                                        disabled={!pathValidation?.valid || saving}
                                                        className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                                                        Confirm
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                {!showPathWarning && pathChanged && pathValidation?.valid && (
                                    <button
                                        onClick={() => setShowPathWarning(true)}
                                        className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <FolderOpen className="w-4 h-4" />
                                        Update Path
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                        <h4 className="font-semibold text-blue-800 flex items-center gap-1 text-xs">
                            <Info className="w-3 h-3" />
                            Tips
                        </h4>
                        <ul className="text-[10px] text-blue-700 mt-1 space-y-0.5">
                            <li>• Keep only ONE Excel file at a time</li>
                            <li>• Don't open the file during auto-import</li>
                            <li>• Files move to "Processed" after import</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - iPhone Style Alarm Clock (Full Screen Navigation) */}
            <div className="w-[340px] bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col relative">

                {/* MAIN ALARM LIST SCREEN */}
                <div className={`absolute inset-0 flex flex-col transition-transform duration-500 ease-in-out ${
                    isAddingAlarm ? '-translate-x-full' : 'translate-x-0'
                }`}>
                    {/* HEADER */}
                    
                    <div className="px-6 pt-6 pb-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scheduler</h1>
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                                Auto-Fetch Schedule
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsAddingAlarm(true)} 
                            disabled={!settings?.path_exists}
                            className="w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!settings?.path_exists ? "Configure source path first" : "Add new schedule"}
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Status Pill */}
                    {settings && !settings.path_exists && (
                        <div className="mx-5 mb-3 p-2 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span className="text-xs text-amber-700 font-medium">Configure path first</span>
                        </div>
                    )}

                    {/* ALARM LIST */}
                    <div className="flex-1 px-4 pb-6 overflow-y-auto">
                        {loading && alarms.length === 0 ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="animate-spin text-slate-300 w-8 h-8" />
                            </div>
                        ) : alarms.length === 0 ? (
                            <div className="text-center py-16 text-slate-300">
                                <Clock className="w-14 h-14 mx-auto mb-3 opacity-30" />
                                <p className="text-base font-medium text-slate-400">No alarms</p>
                                <p className="text-xs text-slate-300 mt-1">
                                    {settings?.path_exists ? "Tap + to create" : "Set up path first"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {alarms.map((alarm) => (
                                    <div 
                                        key={alarm.id} 
                                        className={`group flex items-center justify-between p-4 rounded-2xl transition-all ${
                                            alarm.enabled ? 'bg-slate-50' : 'bg-gray-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => deleteAlarm(alarm.id)} 
                                                className="text-slate-200 hover:text-red-500 p-1 -ml-1 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div>
                                                <div className={`text-3xl font-light tracking-tight ${alarm.enabled ? 'text-slate-800' : 'text-slate-300'}`}>
                                                    {alarm.time.split(' ')[0]}
                                                    <span className="text-sm ml-1 font-medium">{alarm.time.split(' ')[1]}</span>
                                                </div>
                                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                    {alarm.label} • {alarm.repeat_text}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toggleAlarm(alarm.id, alarm.enabled)} 
                                            className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${
                                                alarm.enabled ? 'bg-green-500' : 'bg-slate-200'
                                            }`}
                                        >
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                                                alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ADD ALARM FULL SCREEN (slides in from right) */}
                <div className={`absolute inset-0 bg-gray-100 flex flex-col transition-transform duration-500 ease-in-out ${
                    isAddingAlarm ? 'translate-x-0' : 'translate-x-full'
                }`}>
                    {/* Top Navigation Bar */}
                    <div className="px-6 pt-6 pb-4 flex justify-between items-center bg-gray-100">
                        <button 
                            onClick={() => setIsAddingAlarm(false)}
                            className="text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <h2 className="font-bold text-slate-900 text-lg">Add Alarm</h2>
                        <button 
                            form="alarm-form" 
                            type="submit" 
                            className="text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors"
                        >
                            Save
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 bg-white rounded-t-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="pt-6 px-4 pb-6">
                            <AddAlarmForm onSave={handleAdd} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// WHEEL PICKER COMPONENT (unchanged, perfect as-is)
// ──────────────────────────────────────────────────────────────
const WheelPicker: React.FC<{
    items: (string | number)[];
    selectedIndex: number;
    onChange: (index: number) => void;
    itemHeight?: number;
}> = ({ items, selectedIndex, onChange, itemHeight = 40 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (containerRef.current && !isScrolling) {
            containerRef.current.scrollTop = selectedIndex * itemHeight;
        }
    }, [selectedIndex, itemHeight, isScrolling]);

    const handleScroll = () => {
        if (!containerRef.current) return;
        
        setIsScrolling(true);
        
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
            if (!containerRef.current) return;
            
            const scrollTop = containerRef.current.scrollTop;
            const newIndex = Math.round(scrollTop / itemHeight);
            const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex));
            
            containerRef.current.scrollTop = clampedIndex * itemHeight;
            
            if (clampedIndex !== selectedIndex) {
                onChange(clampedIndex);
            }
            
            setIsScrolling(false);
        }, 100);
    };

    const handleItemClick = (index: number) => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: index * itemHeight,
                behavior: 'smooth'
            });
        }
        onChange(index);
    };

    return (
        <div className="relative h-[120px] overflow-hidden">
            <div 
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-gray-200/50 rounded-lg pointer-events-none z-0"
                style={{ height: itemHeight }}
            />
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none" />
            
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto scrollbar-hide relative z-5"
                style={{ 
                    scrollSnapType: 'y mandatory',
                    paddingTop: 40,
                    paddingBottom: 40,
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => handleItemClick(index)}
                        className={`flex items-center justify-center cursor-pointer transition-all duration-150 ${
                            index === selectedIndex
                                ? 'text-black text-2xl font-semibold scale-105'
                                : 'text-gray-400 text-lg'
                        }`}
                        style={{ 
                            height: itemHeight,
                            scrollSnapAlign: 'center',
                        }}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// ADD ALARM FORM (unchanged)
// ──────────────────────────────────────────────────────────────
const AddAlarmForm: React.FC<{ onSave: (time: string, label: string, days: number[]) => void }> = ({ onSave }) => {
    const [hourIndex, setHourIndex] = useState(9);
    const [minuteIndex, setMinuteIndex] = useState(0);
    const [ampmIndex, setAmpmIndex] = useState(0);
    const [label, setLabel] = useState("Daily Sync");
    const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

    const hours = [...Array(12)].map((_, i) => i + 1);
    const minutes = [...Array(60)].map((_, i) => i.toString().padStart(2, '0'));
    const ampm = ['AM', 'PM'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hour = hours[hourIndex];
        const minute = minutes[minuteIndex];
        const period = ampm[ampmIndex];
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute} ${period}`;
        onSave(timeStr, label, days);
    };

    const toggleDay = (d: number) => {
        if (days.includes(d)) {
            if (days.length > 1) setDays(days.filter(day => day !== d));
        } else {
            setDays([...days, d].sort());
        }
    };

    const get24Hour = () => {
        let h = hours[hourIndex];
        const p = ampm[ampmIndex];
        if (p === 'PM' && h !== 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${minutes[minuteIndex]}`;
    };

    const setFrom24Hour = (val: string) => {
        const [hStr, mStr] = val.split(':');
        let h = parseInt(hStr);
        const m = parseInt(mStr);
        
        const isPM = h >= 12;
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        
        setHourIndex(h - 1);
        setMinuteIndex(m);
        setAmpmIndex(isPM ? 1 : 0);
    };

    return (
        <form id="alarm-form" onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm">
                <div className="flex items-center justify-center py-2">
                    <div className="w-20">
                        <WheelPicker items={hours} selectedIndex={hourIndex} onChange={setHourIndex} />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 px-1">:</div>
                    <div className="w-20">
                        <WheelPicker items={minutes} selectedIndex={minuteIndex} onChange={setMinuteIndex} />
                    </div>
                    <div className="w-16 ml-2">
                        <WheelPicker items={ampm} selectedIndex={ampmIndex} onChange={setAmpmIndex} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between mb-2">
                <div className="flex items-center text-slate-700 font-medium text-sm">
                    <Keyboard className="w-4 h-4 mr-2 text-gray-400" /> Manual
                </div>
                <input
                    type="time"
                    value={get24Hour()}
                    onChange={(e) => setFrom24Hour(e.target.value)}
                    className="text-right text-base font-bold text-blue-600 bg-gray-50 px-2 py-1 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
                />
            </div>

            <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between mb-2">
                <div className="flex items-center text-slate-700 font-medium text-sm">
                    <Bell className="w-4 h-4 mr-2 text-gray-400" /> Label
                </div>
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="text-right text-gray-600 outline-none bg-transparent text-sm"
                    placeholder="Daily Sync"
                />
            </div>

            <div className="bg-white rounded-xl px-4 py-3">
                <div className="flex items-center text-slate-700 font-medium text-sm mb-3">
                    <Repeat className="w-4 h-4 mr-2 text-gray-400" /> Repeat
                </div>
                <div className="flex justify-between">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => toggleDay(i)}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                days.includes(i)
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-110'
                                    : 'bg-gray-100 text-gray-400'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </form>
    );
};

export default SetAttendanceTaskTime;


