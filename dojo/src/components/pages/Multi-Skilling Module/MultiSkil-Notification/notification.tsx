import React, { useEffect, useState } from "react";
import MultiSkillNav from "../mutliSkillNavbar/MultiSkillNav"; // Adjust the import path as needed
import { Award} from 'lucide-react';
// --- Interfaces ---
interface DisplayMultiSkilling {
  id: string;
  employee_name: string;
  emp_id: string;
  department_name: string;
  station_name: string;
  skill_level: string;
  start_date: string;
  remarks?: string;
  status: string;
  current_status: string;
}

// --- Icons ---
const NotificationIcon = () => (
  <svg width="24" height="24" fill="none" stroke="#275080" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M12 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 18h14M18 7a6 6 0 1 0-12 0v7a2 2 0 0 1-2 2h16a2 2 0 0 1-2-2V7Z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="22" height="22" fill="none" stroke="#356087" strokeWidth="1.6" viewBox="0 0 24 24" style={{ minWidth: 22 }}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-4 0v2" />
    <path d="M3 12h18" />
  </svg>
);

const Calendar = () => (
  <svg width="20" height="20" fill="none" stroke="#1170b8" strokeWidth="1.5" viewBox="0 0 24 24">
    <rect x="4" y="6" width="16" height="14" rx="2"/>
    <path d="M16 2v4M8 2v4M4 10h16" />
  </svg>
);

const User = () => (
  <svg width="20" height="20" fill="none" stroke="#375273" strokeWidth="1.6" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
  </svg>
);

const Target = () => (
  <svg width="20" height="20" fill="none" stroke="#375273" strokeWidth="1.6" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

// --- Accordion ---
type AccordionProps = {
  children: React.ReactNode;
  open: boolean;
  onClick: () => void;
  header: string;
  unread: boolean;
  date: string;
  status: string;
};

function Accordion({ children, open, onClick, header, unread, date, status }: AccordionProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "border-green-400 bg-gradient-to-r from-green-50 to-white";
      case "in-progress": return "border-yellow-400 bg-gradient-to-r from-yellow-50 to-white";
      case "scheduled": return "border-blue-400 bg-gradient-to-r from-blue-50 to-white";
      default: return "border-gray-300 bg-white";
    }
  };

  return (
    <div
      className={`mb-5 transition-shadow border rounded-xl shadow hover:shadow-lg duration-200 ${getStatusColor(status)}`}
      style={{
        minHeight: 74,
        fontSize: "1.09rem",
        overflow: "hidden",
        borderLeft: unread ? '5px solid #3478b8' : '3px solid #c6d0da'
      }}
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-6 py-5 text-left font-medium ${
          unread ? "text-[#2a4669]" : "text-[#263847]"
        }`}
        type="button"
      >
        <span className="flex items-center gap-3">
          <Target />
          <span>{header}</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
            status?.toLowerCase() === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
            status?.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </span>
        </span>
        <span className="flex items-center gap-4">
          <span className="text-xs text-gray-500">{date}</span>
          <span
            className={`inline-block ml-2 transform transition-transform ${open ? "rotate-180" : ""}`}
            style={{ fontSize: "1.3em", color: "#87a4c2" }}
          >▼</span>
        </span>
      </button>
      <div className={`overflow-hidden transition-all px-6 ${open ? "max-h-screen pb-6" : "max-h-0 pb-0"}`}>
        {open && <div className="pt-1">{children}</div>}
      </div>
    </div>
  );
}

// --- Main Component ---
const MultiNotification: React.FC = () => {
  const [multiSkills, setMultiSkills] = useState<DisplayMultiSkilling[]>([]);
  const [filtered, setFiltered] = useState<DisplayMultiSkilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [accordionOpen, setAccordionOpen] = useState<{ [id: string]: boolean }>({});
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("multiSkillReadIds");
    if (stored) setReadIds(JSON.parse(stored));
  }, []);

  function markAsRead(id: string) {
    if (!readIds.includes(id)) {
      const newRead = [...readIds, id];
      setReadIds(newRead);
      localStorage.setItem("multiSkillReadIds", JSON.stringify(newRead));
    }
  }

  // --- Fetch data from new MultiSkilling API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/multiskilling/");
        
        if (!response.ok) {
          throw new Error("Failed to fetch multiskilling data");
        }

        const multiData = await response.json();
        console.log("📊 MultiSkilling data:", multiData);

        const transformed: DisplayMultiSkilling[] = multiData.map((item: any) => ({
          id: String(item.id),
          employee_name: item.employee_name || `Employee ${item.emp_id}`,
          emp_id: item.emp_id || "",
          department_name: item.department_name || item.department_from_hierarchy || "N/A",
          station_name: item.station_name || "Unknown Station",
          skill_level: item.skill_level || "Unknown Level",
          start_date: item.start_date,
          remarks: item.remarks || "No remarks provided",
          status: item.status || "scheduled",
          current_status: item.current_status || item.status || "scheduled"
        }));

        // Sort by start_date (newest first)
        const sorted = transformed.sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );

        setMultiSkills(sorted);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching multiskilling data:", err);
        setError(err instanceof Error ? err.message : "Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtering
  useEffect(() => {
    const now = new Date();
    let list = [...multiSkills];
    
    if (filter === "day") {
      const today = now.toDateString();
      list = list.filter(s => new Date(s.start_date).toDateString() === today);
    } else if (filter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - start.getDay()); // Start of week
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // End of week
      list = list.filter(s => {
        const date = new Date(s.start_date);
        return date >= start && date <= end;
      });
    } else if (filter === "month") {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      list = list.filter(s => {
        const date = new Date(s.start_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
    }

    // Sort: unread first, then read
    list = [
      ...list.filter(s => !readIds.includes(s.id)),
      ...list.filter(s => readIds.includes(s.id))
    ];
    
    setFiltered(list);
  }, [filter, multiSkills, readIds]);

  function formatDate(date: string) {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  }

  const SkillDetail: React.FC<{ skill: DisplayMultiSkilling }> = ({ skill }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User />
        <span className="font-semibold text-[#294461]">{skill.employee_name}</span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          ID: {skill.emp_id}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BriefcaseIcon />
            <span className="text-sm text-gray-600">Department:</span>
            <span className="font-medium text-gray-800">{skill.department_name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Target />
            <span className="text-sm text-gray-600">Station:</span>
            <span className="font-medium text-gray-800">{skill.station_name}</span>
          </div>
        </div>

        <div className="space-y-2">
          < div className="flex items-center gap-2">
            < Award />
            <span className="text-sm text-gray-600">Skill Level:</span>
            <span className="font-semibold text-blue-600">{skill.skill_level}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar />
            <span className="text-sm text-gray-600">Start Date:</span>
            <span className="font-medium text-gray-800">{formatDate(skill.start_date)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="text-sm text-gray-600 block mb-1">Status:</span>
        <div className={`px-3 py-2 inline-block rounded-lg font-medium text-sm ${
          skill.current_status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
          skill.current_status?.toLowerCase() === 'in-progress' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
          skill.current_status?.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
          'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {skill.current_status || skill.status}
        </div>
      </div>

      {skill.remarks && skill.remarks !== "No remarks provided" && (
        <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
          <span className="text-sm text-gray-600 block mb-1">Remarks:</span>
          <span className="text-gray-800">{skill.remarks}</span>
        </div>
      )}
    </div>
  );

  const recentSkill = multiSkills.find(s => !readIds.includes(s.id));
  const unreadCount = filtered.filter(s => !readIds.includes(s.id)).length;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading multiskilling notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center text-red-600 bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f7f9fb]">
      <MultiSkillNav />
      <div className="max-w-full px-4 sm:px-6 lg:px-8 pt-9 pb-5 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            {/* <NotificationIcon /> */}
            <h2 className="text-3xl font-bold text-gray-800">MultiSkilling Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-4 py-2 bg-white focus:border-blue-500 focus:outline-none"
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {recentSkill && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-3 text-green-800 font-semibold">
              <NotificationIcon />
              <span>New multiskill assignment: <strong>{recentSkill.station_name}</strong> for {recentSkill.employee_name}</span>
            </div>
            <button 
              onClick={() => markAsRead(recentSkill.id)} 
              className="bg-green-100 hover:bg-green-200 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Mark as read
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg">
            <NotificationIcon />
            <h3 className="text-xl font-semibold mt-4 mb-2">No notifications found</h3>
            <p>
              {filter === "all" 
                ? "No multiskilling assignments have been created yet." 
                : `No multiskilling assignments found for the selected time period.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(skill => {
              const open = accordionOpen[skill.id] || false;
              const unread = !readIds.includes(skill.id);
              return (
                <Accordion
                  key={skill.id}
                  open={open}
                  header={`${skill.station_name} - ${skill.employee_name}`}
                  date={formatDate(skill.start_date)}
                  unread={unread}
                  status={skill.current_status || skill.status}
                  onClick={() => {
                    setAccordionOpen(prev => ({ ...prev, [skill.id]: !open }));
                    if (unread) markAsRead(skill.id);
                  }}
                >
                  <SkillDetail skill={skill} />
                </Accordion>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center text-gray-500 text-sm">
          Showing {filtered.length} of {multiSkills.length} multiskilling assignments
        </div>
      </div>
    </div>
  );
};

export default MultiNotification;
