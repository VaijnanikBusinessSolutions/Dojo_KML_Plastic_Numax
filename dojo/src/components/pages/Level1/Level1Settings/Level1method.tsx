// import { Delete, Edit } from "lucide-react";
// import React, { useEffect, useMemo, useRef, useState } from "react";

// const API_BASE = "http://127.0.0.1:8000";
// const LEVEL_ID = 1;

// // Types (updated without Topic)
// interface Day { days_id: number; day: string; }
// interface LessonCard { id: number; title: string; day: number; day_name: string; level_name: string; } // from SubTopicListSerializer
// interface SubtopicContent { subtopiccontent_id: number; subtopic: number; content: string; }
// interface TrainingContent {
//   id: number; description: string;
//   training_file?: string | null; url_link?: string | null;
//   subtopiccontent: number;
// }

// type ToastType = "success" | "error" | "info";

// export default function Level1SettingsPro() {
//   // Data (removed topics)
//   const [days, setDays] = useState<Day[]>([]);
//   const [lessons, setLessons] = useState<LessonCard[]>([]);
//   const [contents, setContents] = useState<SubtopicContent[]>([]);
//   const [materials, setMaterials] = useState<TrainingContent[]>([]);

//   // Filters + selections (removed topic selection)
//   const [selectedDay, setSelectedDay] = useState<number | null>(null);
//   const [search, setSearch] = useState("");
//   const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
//   const [selectedContent, setSelectedContent] = useState<number | null>(null);

//   // Modals
//   const [showLessonModal, setShowLessonModal] = useState(false);
//   const [lessonName, setLessonName] = useState("");
//   const [showContentModal, setShowContentModal] = useState(false);
//   const [contentText, setContentText] = useState("");
//   const [showMaterialModal, setShowMaterialModal] = useState(false);
//   const [matDesc, setMatDesc] = useState("");
//   const [matType, setMatType] = useState<"file" | "link">("file");
//   const [matUrl, setMatUrl] = useState("");
//   const [matFile, setMatFile] = useState<File | null>(null);
//   const fileRef = useRef<HTMLInputElement>(null);

//   // Quick add Day
//   const [newDay, setNewDay] = useState("");

//   // UI helpers
//   const [isBusy, setIsBusy] = useState(false);
//   const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
//   const [showTips, setShowTips] = useState(true);
//   const [confirm, setConfirm] = useState<{ text: string; onYes: () => void } | null>(null);

//   // Stepper state (updated without topic)
//   const steps = useMemo(() => ([
//     { key: "day", label: "Select Day", done: !!selectedDay },
//     { key: "lesson", label: "Create/Select Lesson", done: !!selectedLesson },
//     { key: "content", label: "Add Content", done: contents.length > 0 },
//     { key: "material", label: "Upload Material", done: materials.length > 0 },
//   ]), [selectedDay, selectedLesson, contents.length, materials.length]);

//   // Load days only
//   useEffect(() => {
//     (async () => {
//       try {
//         const days = await fetch(`${API_BASE}/days/?level=${LEVEL_ID}`).then(r => r.json());
//         setDays(days);
//       } catch (e) {
//         errorToast("Failed to load Days");
//       }
//     })();
//   }, []);

//   // Load lessons when filters change (only day filter now)
//   useEffect(() => {
//     (async () => {
//       try {
//         const params = new URLSearchParams();
//         params.set("level", String(LEVEL_ID));
//         if (selectedDay) params.set("days", String(selectedDay));
//         const rows: LessonCard[] = await fetch(`${API_BASE}/subtopics/?${params.toString()}`).then(r => r.json());
//         setLessons(rows);
//         // reset dependent selections
//         setSelectedLesson(null);
//         setContents([]); setSelectedContent(null); setMaterials([]);
//       } catch {
//         errorToast("Failed to load Lessons");
//       }
//     })();
//   }, [selectedDay]);

//   // Load contents when lesson changes
//   useEffect(() => {
//     (async () => {
//       if (!selectedLesson) { setContents([]); setSelectedContent(null); setMaterials([]); return; }
//       try {
//         const rows: SubtopicContent[] = await fetch(`${API_BASE}/subtopic-contents/?subtopic=${selectedLesson}`).then(r => r.json());
//         setContents(rows);
//         setSelectedContent(null);
//         setMaterials([]);
//       } catch {
//         errorToast("Failed to load Contents");
//       }
//     })();
//   }, [selectedLesson]);

//   // Load materials when content changes
//   useEffect(() => {
//     (async () => {
//       if (!selectedContent) { setMaterials([]); return; }
//       try {
//         const rows: TrainingContent[] = await fetch(`${API_BASE}/training-contents/?subtopiccontent=${selectedContent}`).then(r => r.json());
//         setMaterials(rows);
//       } catch {
//         errorToast("Failed to load Materials");
//       }
//     })();
//   }, [selectedContent]);

//   // Toast helpers
//   const infoToast = (m: string) => { setToast({ type: "info", message: m }); setTimeout(() => setToast(null), 2500); };
//   const okToast = (m: string) => { setToast({ type: "success", message: m }); setTimeout(() => setToast(null), 2500); };
//   const errorToast = (m: string) => { setToast({ type: "error", message: m }); setTimeout(() => setToast(null), 3500); };

//   // Day actions
//   const addDay = async () => {
//     const label = newDay.trim();
//     if (!label) return infoToast("Enter a day label, e.g., Day 1");
//     setIsBusy(true);
//     try {
//       const res = await fetch(`${API_BASE}/days/`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ day: label, level: LEVEL_ID }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       const created: Day = await res.json();
//       setDays(prev => [...prev, created]);
//       setNewDay("");
//       okToast("Day added");
//     } catch (e) {
//       errorToast("Failed to add Day");
//     } finally { setIsBusy(false); }
//   };

//   const renameDay = async (d: Day) => {
//     const newName = prompt("Rename Day", d.day) ?? "";
//     if (!newName.trim()) return;
//     setIsBusy(true);
//     try {
//       const res = await fetch(`${API_BASE}/days/${d.days_id}/`, {
//         method: "PATCH", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ day: newName.trim() }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       setDays(prev => prev.map(x => x.days_id === d.days_id ? { ...x, day: newName.trim() } : x));
//       okToast("Day renamed");
//     } catch { errorToast("Failed to rename Day"); } finally { setIsBusy(false); }
//   };

//   const deleteDay = async (id: number) => {
//     setConfirm({ text: "Delete this day? This may delete lessons under it.", onYes: async () => {
//       setConfirm(null); setIsBusy(true);
//       try {
//         const res = await fetch(`${API_BASE}/days/${id}/`, { method: "DELETE" });
//         if (res.status !== 204) throw new Error();
//         setDays(prev => prev.filter(x => x.days_id !== id));
//         if (selectedDay === id) setSelectedDay(null);
//         okToast("Day deleted");
//       } catch { errorToast("Failed to delete Day"); } finally { setIsBusy(false); }
//     }});
//   };

//   // Lesson actions (updated to not require topic)
//   const createLesson = async () => {
//     if (!lessonName.trim()) return infoToast("Enter a lesson name");
//     if (!selectedDay) return infoToast("Pick a Day first");
//     setIsBusy(true);
//     try {
//       const res = await fetch(`${API_BASE}/subtopics/`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           subtopic_name: lessonName.trim(), 
//           days: selectedDay, 
//           level: LEVEL_ID 
//         }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       setLessonName(""); setShowLessonModal(false);
//       // refresh lessons
//       const params = new URLSearchParams();
//       params.set("level", String(LEVEL_ID));
//       if (selectedDay) params.set("days", String(selectedDay));
//       const rows: LessonCard[] = await fetch(`${API_BASE}/subtopics/?${params.toString()}`).then(r => r.json());
//       setLessons(rows);
//       okToast("Lesson created");
//     } catch { errorToast("Failed to create Lesson"); } finally { setIsBusy(false); }
//   };

//   const renameLesson = async (l: LessonCard) => {
//     const newName = prompt("Rename Lesson", l.title) ?? "";
//     if (!newName.trim()) return;
//     setIsBusy(true);
//     try {
//       const res = await fetch(`${API_BASE}/subtopics/${l.id}/`, {
//         method: "PATCH", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ subtopic_name: newName.trim() }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       setLessons(prev => prev.map(x => x.id === l.id ? { ...x, title: newName.trim() } : x));
//       okToast("Lesson renamed");
//     } catch { errorToast("Failed to rename Lesson"); } finally { setIsBusy(false); }
//   };

//   const deleteLesson = async (id: number) => {
//     setConfirm({ text: "Delete this lesson and everything inside?", onYes: async () => {
//       setConfirm(null); setIsBusy(true);
//       try {
//         const res = await fetch(`${API_BASE}/subtopics/${id}/`, { method: "DELETE" });
//         if (res.status !== 204) throw new Error();
//         setLessons(prev => prev.filter(x => x.id !== id));
//         if (selectedLesson === id) { setSelectedLesson(null); setContents([]); setSelectedContent(null); setMaterials([]); }
//         okToast("Lesson deleted");
//       } catch { errorToast("Failed to delete Lesson"); } finally { setIsBusy(false); }
//     }});
//   };

//   // Content actions (unchanged)
//   const createContent = async () => {
//     if (!selectedLesson) return infoToast("Select a lesson first");
//     if (!contentText.trim()) return infoToast("Enter content text");
//     setIsBusy(true);
//     try {
//       const res = await fetch(`${API_BASE}/subtopic-contents/`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ subtopic: selectedLesson, content: contentText.trim() }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       const created: SubtopicContent = await res.json();
//       setContents(prev => [...prev, created]);
//       setContentText(""); setShowContentModal(false);
//       okToast("Content added");
//     } catch { errorToast("Failed to add Content"); } finally { setIsBusy(false); }
//   };

//   const deleteContent = async (id: number) => {
//     setConfirm({ text: "Delete this content and its materials?", onYes: async () => {
//       setConfirm(null); setIsBusy(true);
//       try {
//         const res = await fetch(`${API_BASE}/subtopic-contents/${id}/`, { method: "DELETE" });
//         if (res.status !== 204) throw new Error();
//         setContents(prev => prev.filter(c => c.subtopiccontent_id !== id));
//         if (selectedContent === id) { setSelectedContent(null); setMaterials([]); }
//         okToast("Content deleted");
//       } catch { errorToast("Failed to delete Content"); } finally { setIsBusy(false); }
//     }});
//   };

//   // Material actions (unchanged)
//   const addMaterial = async () => {
//     if (!selectedContent) return infoToast("Pick a content item");
//     if (!matDesc.trim()) return infoToast("Enter a description");
//     const form = new FormData();
//     form.append("description", matDesc.trim());
//     form.append("subtopiccontent", String(selectedContent));
//     if (matType === "file") {
//       if (!matFile) return infoToast("Choose a file");
//       form.append("training_file", matFile);
//     } else {
//       if (!matUrl.trim()) return infoToast("Enter a URL");
//       form.append("url_link", matUrl.trim());
//     }
//     setIsBusy(true);
//     try {
//       const res = await fetch(`${API_BASE}/training-contents/`, { method: "POST", body: form });
//       if (!res.ok) throw new Error(await res.text());
//       const created: TrainingContent = await res.json();
//       setMaterials(prev => [...prev, created]);
//       setMatDesc(""); setMatUrl(""); setMatFile(null); setShowMaterialModal(false);
//       okToast("Material added");
//     } catch (e) {
//       errorToast("Failed to add Material");
//     } finally { setIsBusy(false); }
//   };

//   const deleteMaterial = async (id: number) => {
//     setConfirm({ text: "Delete this material?", onYes: async () => {
//       setConfirm(null); setIsBusy(true);
//       try {
//         const res = await fetch(`${API_BASE}/training-contents/${id}/`, { method: "DELETE" });
//         if (res.status !== 204) throw new Error();
//         setMaterials(prev => prev.filter(m => m.id !== id));
//         okToast("Material deleted");
//       } catch { errorToast("Failed to delete Material"); } finally { setIsBusy(false); }
//     }});
//   };

//   // Filtered lessons by search
//   const filteredLessons = useMemo(() => {
//     const term = search.trim().toLowerCase();
//     if (!term) return lessons;
//     return lessons.filter(l => l.title.toLowerCase().includes(term));
//   }, [search, lessons]);

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-[#1c2a4d]">Level 1 Settings</h1>
//           <p className="text-sm text-gray-600">Manage training structure, content, and materials in a guided flow.</p>
//         </div>
//         <button
//           className="text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
//           onClick={() => setShowTips(v => !v)}
//         >
//           {showTips ? "Hide" : "Show"} Instructions
//         </button>
//       </div>

//       {/* Instructions (updated) */}
//       {showTips && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
//           <div className="font-semibold mb-1">How to use</div>
//           <ol className="list-decimal ml-5 space-y-1">
//             <li>Select a Day (chip) to filter lessons by day.</li>
//             <li>Click "+ Add Lesson" to create a lesson under the selected Day.</li>
//             <li>Select a Lesson card → click "+ Add Content" to add textual content.</li>
//             <li>Click a Content item → add Materials (upload file or add a link).</li>
//             <li>Use Edit/Delete on cards to maintain your structure. Changes save instantly.</li>
//           </ol>
//           <div className="mt-2 text-xs text-blue-800">
//             Tip: You can search lessons, rename items inline, and open materials in new tabs.
//           </div>
//         </div>
//       )}

//       {/* Stepper (updated) */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex flex-wrap gap-4">
//           {steps.map((s, i) => (
//             <div key={s.key} className="flex items-center gap-2">
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
//                 ${s.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}>
//                 {s.done ? "✓" : i + 1}
//               </div>
//               <span className={`text-sm ${s.done ? "text-green-700" : "text-gray-700"}`}>{s.label}</span>
//               {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300" />}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Filters row (updated to remove topic) */}
//       <div className="bg-white rounded-lg shadow p-4 space-y-4">
//         {/* Day chips */}
//         <div className="flex flex-wrap gap-2">
//           {days.map(d => (
//             <div key={d.days_id} className={`flex items-center gap-2 px-3 py-1 rounded-full border
//               ${selectedDay === d.days_id ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
//               <button className="font-medium" onClick={() => setSelectedDay(selectedDay === d.days_id ? null : d.days_id)}>{d.day}</button>
//               <button className="text-xs opacity-80 hover:opacity-100" title="Rename" onClick={() => renameDay(d)}>✎</button>
//               <button className="text-xs opacity-80 hover:opacity-100" title="Delete" onClick={() => deleteDay(d.days_id)}>✕</button>
//             </div>
//           ))}
//           <div className="flex items-center gap-2">
//             <input className="border px-3 py-1 rounded" placeholder="Add Day (e.g., Day 1)" value={newDay} onChange={e => setNewDay(e.target.value)} />
//             <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={addDay} disabled={isBusy}>Add</button>
//           </div>
//         </div>

//         {/* Search + Add Lesson (removed topic selector) */}
//         <div className="flex flex-wrap items-center gap-3">
//           <div className="flex items-center gap-2 ml-auto">
//             <input
//               className="border px-3 py-1 rounded"
//               placeholder="Search lessons..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />
//             <button
//               onClick={() => setShowLessonModal(true)}
//               className="px-4 py-2 bg-blue-600 text-white rounded"
//               disabled={!selectedDay}
//               title={!selectedDay ? "Pick a Day first" : "Add Lesson"}
//             >
//               + Add Lesson
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main columns */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Lessons */}
//         <div className="bg-white rounded-lg shadow p-4">
//           <h2 className="font-semibold text-[#1c2a4d] mb-3">Lessons</h2>
//           {filteredLessons.length === 0 ? (
//             <EmptyState
//               title="No lessons found"
//               subtitle={selectedDay ? "Try changing filters or add a new lesson." : "Pick a Day to start adding lessons."}
//               actionText={selectedDay ? "Add Lesson" : undefined}
//               onAction={selectedDay ? () => setShowLessonModal(true) : undefined}
//             />
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {filteredLessons.map(l => (
//                 <div
//                   key={l.id}
//                   className={`border rounded-lg p-4 hover:shadow transition cursor-pointer ${selectedLesson === l.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`}
//                   onClick={() => setSelectedLesson(l.id)}
//                 >
//                   <div className="text-xs text-gray-500 mb-1">{l.day_name}</div>
//                   <div className="font-semibold text-[#1c2a4d] truncate">{l.title}</div>
//                   <div className="mt-3 flex gap-2">
//                     <button className="text-sm px-2 py-1 bg-gray-100 rounded" onClick={(e) => { e.stopPropagation(); renameLesson(l); }}>Edit</button>
//                     <button className="text-sm px-2 py-1 bg-red-500 text-white rounded" onClick={(e) => { e.stopPropagation(); deleteLesson(l.id); }}>Delete</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Lesson workspace (unchanged) */}
//         <div className="bg-white rounded-lg shadow p-4">
//           <div className="flex items-center justify-between mb-3">
//             <h2 className="font-semibold text-[#1c2a4d]">Lesson workspace</h2>
//             <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => setShowContentModal(true)} disabled={!selectedLesson}>
//               + Add Content
//             </button>
//           </div>

//           {!selectedLesson ? (
//             <EmptyState
//               title="No lesson selected"
//               subtitle="Select a lesson on the left to manage its content and materials."
//             />
//           ) : (
//             <div className="space-y-2">
//               {contents.length === 0 && (
//                 <EmptyState
//                   title="No content yet"
//                   subtitle="Add the first content item for this lesson."
//                   actionText="Add Content"
//                   onAction={() => setShowContentModal(true)}
//                 />
//               )}
//               {contents.map(c => (
//                 <div
//                   key={c.subtopiccontent_id}
//                   className={`p-3 border rounded-lg ${selectedContent === c.subtopiccontent_id ? "border-blue-500" : "border-gray-200"}`}
//                   onClick={() => setSelectedContent(c.subtopiccontent_id)}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div className="font-medium text-[#1c2a4d]">{c.content}</div>
//                     <button className="text-sm px-2 py-1 bg-red-500 text-white rounded" onClick={(e) => { e.stopPropagation(); deleteContent(c.subtopiccontent_id); }}>
//                       Delete
//                     </button>
//                   </div>

//                   {/* Materials */}
//                   {selectedContent === c.subtopiccontent_id && (
//                     <div className="mt-3 border-t pt-3">
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm text-gray-600">Materials</div>
//                         <button className="text-sm px-2 py-1 bg-gray-100 rounded" onClick={() => setShowMaterialModal(true)}>+ Add</button>
//                       </div>

//                       {materials.length === 0 ? (
//                         <div className="mt-2">
//                           <EmptyState
//                             title="No materials yet"
//                             subtitle="Upload a file or add a web link."
//                             actionText="Add Material"
//                             onAction={() => setShowMaterialModal(true)}
//                             compact
//                           />
//                         </div>
//                       ) : (
//                         <div className="mt-2 space-y-2">
//                           {materials.map(m => (
//                             <div key={m.id} className="p-2 border rounded flex items-center justify-between">
//                               <div className="min-w-0">
//                                 <div className="font-medium truncate">{m.description}</div>
//                                 <div className="text-xs text-gray-500">{m.url_link ? "Web Link" : m.training_file ? "File" : "—"}</div>
//                               </div>
//                               <div className="flex gap-2">
//                                 {m.url_link && (
//                                   <a className="px-2 py-1 bg-gray-100 rounded" href={m.url_link} target="_blank" rel="noreferrer">Open</a>
//                                 )}
//                                 {m.training_file && (
//                                   <a className="px-2 py-1 bg-gray-100 rounded" href={m.training_file} target="_blank" rel="noreferrer">Open</a>
//                                 )}
//                                 <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => deleteMaterial(m.id)}><Delete size={16} /></button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Lesson Modal (updated) */}
//       {showLessonModal && (
//         <Modal title="Create Lesson" onClose={() => setShowLessonModal(false)}>
//           <p className="text-sm text-gray-600 mb-3">This lesson will be created under the selected Day.</p>
//           <input className="border p-2 w-full rounded mb-3" placeholder="Lesson name" value={lessonName} onChange={(e) => setLessonName(e.target.value)} />
//           <div className="flex justify-end gap-2">
//             <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setShowLessonModal(false)}>Cancel</button>
//             <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={createLesson} disabled={isBusy}>Create</button>
//           </div>
//         </Modal>
//       )}

//       {/* Content Modal (unchanged) */}
//       {showContentModal && (
//         <Modal title="Add Content" onClose={() => setShowContentModal(false)}>
//           <textarea className="border p-2 w-full rounded mb-3" rows={4} placeholder="Write content text..." value={contentText} onChange={(e) => setContentText(e.target.value)} />
//           <div className="flex justify-end gap-2">
//             <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setShowContentModal(false)}>Cancel</button>
//             <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={createContent} disabled={isBusy}>Add</button>
//           </div>
//         </Modal>
//       )}

//       {/* Material Modal (unchanged) */}
//       {showMaterialModal && (
//         <Modal title="Add Material" onClose={() => setShowMaterialModal(false)}>
//           <div className="space-y-3">
//             <input className="border p-2 w-full rounded" placeholder="Description" value={matDesc} onChange={(e) => setMatDesc(e.target.value)} />
//             <div className="flex gap-2">
//               <button className={`px-3 py-2 rounded ${matType === "file" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setMatType("file")}>File</button>
//               <button className={`px-3 py-2 rounded ${matType === "link" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setMatType("link")}>Link</button>
//             </div>

//             {matType === "file" ? (
//               <div
//                 className="border-2 border-dashed rounded p-4 text-center text-sm text-gray-600"
//                 onDragOver={(e) => e.preventDefault()}
//                 onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setMatFile(e.dataTransfer.files[0]); }}
//               >
//                 <p className="mb-2">Drag & drop a file here, or</p>
//                 <input ref={fileRef} type="file" className="hidden" onChange={(e) => setMatFile(e.target.files?.[0] ?? null)} accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mov,.avi,.mkv,.jpg,.jpeg,.png,.gif,.webp,.bmp" />
//                 <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => fileRef.current?.click()}>Choose file</button>
//                 <div className="mt-2 text-xs text-gray-500">{matFile?.name ?? "No file selected"}</div>
//               </div>
//             ) : (
//               <input className="border p-2 w-full rounded" placeholder="https://example.com" value={matUrl} onChange={(e) => setMatUrl(e.target.value)} />
//             )}
//           </div>

//           <div className="flex justify-end gap-2 mt-4">
//             <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setShowMaterialModal(false)}>Cancel</button>
//             <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={addMaterial} disabled={isBusy}>Save</button>
//           </div>
//         </Modal>
//       )}

//       {/* Toast */}
//       {toast && (
//         <div className="fixed right-4 bottom-4 z-50">
//           <div className={`px-4 py-3 rounded shadow text-white ${toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-gray-800"}`}>
//             {toast.message}
//           </div>
//         </div>
//       )}

//       {/* Confirm */}
//       {confirm && (
//         <ConfirmDialog
//           text={confirm.text}
//           onCancel={() => setConfirm(null)}
//           onConfirm={() => confirm.onYes()}
//         />
//       )}

//       {/* Busy overlay */}
//       {isBusy && (
//         <div className="fixed inset-0 z-40 bg-black/10 pointer-events-none">
//           <div className="absolute right-4 top-4 bg-white shadow px-3 py-2 rounded text-sm">Working…</div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ======= Small UI components ======= */

// function EmptyState({ title, subtitle, actionText, onAction, compact }: { title: string; subtitle?: string; actionText?: string; onAction?: () => void; compact?: boolean; }) {
//   return (
//     <div className={`text-center ${compact ? "py-4" : "py-10"} border-2 border-dashed rounded-lg`}>
//       <div className="text-gray-800 font-medium">{title}</div>
//       {subtitle && <div className="text-gray-500 text-sm mt-1">{subtitle}</div>}
//       {actionText && onAction && (
//         <button className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded" onClick={onAction}>
//           {actionText}
//         </button>
//       )}
//     </div>
//   );
// }

// function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; }) {
//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//         <div className="p-4 border-b flex items-center justify-between">
//           <div className="font-semibold">{title}</div>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>
//         <div className="p-4">{children}</div>
//       </div>
//     </div>
//   );
// }

// function ConfirmDialog({ text, onCancel, onConfirm }: { text: string; onCancel: () => void; onConfirm: () => void; }) {
//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
//         <div className="p-4">
//           <div className="font-semibold mb-2">Please confirm</div>
//           <div className="text-sm text-gray-700">{text}</div>
//           <div className="flex justify-end gap-2 mt-4">
//             <button className="px-3 py-2 bg-gray-200 rounded" onClick={onCancel}>Cancel</button>
//             <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={onConfirm}>Delete</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { Delete, Edit, Plus, Search, Calendar, BookOpen, FileText, Link2, Upload, ChevronRight, Check, X, Info, AlertCircle } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";
const LEVEL_ID = 1;

// Types (updated without Topic)
interface Day { days_id: number; day: string; }
interface LessonCard { id: number; title: string; day: number; day_name: string; level_name: string; } // from SubTopicListSerializer
interface SubtopicContent { subtopiccontent_id: number; subtopic: number; content: string; }
interface TrainingContent {
  id: number; description: string;
  training_file?: string | null; url_link?: string | null;
  subtopiccontent: number;
}

type ToastType = "success" | "error" | "info";

export default function Level1SettingsPro() {
  // Data (removed topics)
  const [days, setDays] = useState<Day[]>([]);
  const [lessons, setLessons] = useState<LessonCard[]>([]);
  const [contents, setContents] = useState<SubtopicContent[]>([]);
  const [materials, setMaterials] = useState<TrainingContent[]>([]);

  // Filters + selections (removed topic selection)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [selectedContent, setSelectedContent] = useState<number | null>(null);

  // Modals
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonName, setLessonName] = useState("");
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentText, setContentText] = useState("");
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [matDesc, setMatDesc] = useState("");
  const [matType, setMatType] = useState<"file" | "link">("file");
  const [matUrl, setMatUrl] = useState("");
  const [matFile, setMatFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Quick add Day
  const [newDay, setNewDay] = useState("");

  // UI helpers
  const [isBusy, setIsBusy] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [showTips, setShowTips] = useState(true);
  const [confirm, setConfirm] = useState<{ text: string; onYes: () => void } | null>(null);

  // Stepper state (updated without topic)
  const steps = useMemo(() => ([
    { key: "day", label: "Select Day", done: !!selectedDay },
    { key: "lesson", label: "Create/Select Lesson", done: !!selectedLesson },
    { key: "content", label: "Add Content", done: contents.length > 0 },
    { key: "material", label: "Upload Material", done: materials.length > 0 },
  ]), [selectedDay, selectedLesson, contents.length, materials.length]);

  // Load days only
  useEffect(() => {
    (async () => {
      try {
        const days = await fetch(`${API_BASE}/days/?level=${LEVEL_ID}`).then(r => r.json());
        setDays(days);
      } catch (e) {
        errorToast("Failed to load Days");
      }
    })();
  }, []);

  // Load lessons when filters change (only day filter now)
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams();
        params.set("level", String(LEVEL_ID));
        if (selectedDay) params.set("days", String(selectedDay));
        const rows: LessonCard[] = await fetch(`${API_BASE}/subtopics/?${params.toString()}`).then(r => r.json());
        setLessons(rows);
        // reset dependent selections
        setSelectedLesson(null);
        setContents([]); setSelectedContent(null); setMaterials([]);
      } catch {
        errorToast("Failed to load Lessons");
      }
    })();
  }, [selectedDay]);

  // Load contents when lesson changes
  useEffect(() => {
    (async () => {
      if (!selectedLesson) { setContents([]); setSelectedContent(null); setMaterials([]); return; }
      try {
        const rows: SubtopicContent[] = await fetch(`${API_BASE}/subtopic-contents/?subtopic=${selectedLesson}`).then(r => r.json());
        setContents(rows);
        setSelectedContent(null);
        setMaterials([]);
      } catch {
        errorToast("Failed to load Contents");
      }
    })();
  }, [selectedLesson]);

  // Load materials when content changes
  useEffect(() => {
    (async () => {
      if (!selectedContent) { setMaterials([]); return; }
      try {
        const rows: TrainingContent[] = await fetch(`${API_BASE}/training-contents/?subtopiccontent=${selectedContent}`).then(r => r.json());
        setMaterials(rows);
      } catch {
        errorToast("Failed to load Materials");
      }
    })();
  }, [selectedContent]);

  // Toast helpers
  const infoToast = (m: string) => { setToast({ type: "info", message: m }); setTimeout(() => setToast(null), 2500); };
  const okToast = (m: string) => { setToast({ type: "success", message: m }); setTimeout(() => setToast(null), 2500); };
  const errorToast = (m: string) => { setToast({ type: "error", message: m }); setTimeout(() => setToast(null), 3500); };

  // Day actions
  const addDay = async () => {
    const label = newDay.trim();
    if (!label) return infoToast("Enter a day label, e.g., Day 1");
    setIsBusy(true);
    try {
      const res = await fetch(`${API_BASE}/days/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: label, level: LEVEL_ID }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created: Day = await res.json();
      setDays(prev => [...prev, created]);
      setNewDay("");
      okToast("Day added");
    } catch (e) {
      errorToast("Failed to add Day");
    } finally { setIsBusy(false); }
  };

  const renameDay = async (d: Day) => {
    const newName = prompt("Rename Day", d.day) ?? "";
    if (!newName.trim()) return;
    setIsBusy(true);
    try {
      const res = await fetch(`${API_BASE}/days/${d.days_id}/`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: newName.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDays(prev => prev.map(x => x.days_id === d.days_id ? { ...x, day: newName.trim() } : x));
      okToast("Day renamed");
    } catch { errorToast("Failed to rename Day"); } finally { setIsBusy(false); }
  };

  const deleteDay = async (id: number) => {
    setConfirm({ text: "Delete this day? This may delete lessons under it.", onYes: async () => {
      setConfirm(null); setIsBusy(true);
      try {
        const res = await fetch(`${API_BASE}/days/${id}/`, { method: "DELETE" });
        if (res.status !== 204) throw new Error();
        setDays(prev => prev.filter(x => x.days_id !== id));
        if (selectedDay === id) setSelectedDay(null);
        okToast("Day deleted");
      } catch { errorToast("Failed to delete Day"); } finally { setIsBusy(false); }
    }});
  };

  // Lesson actions (updated to not require topic)
  const createLesson = async () => {
    if (!lessonName.trim()) return infoToast("Enter a lesson name");
    if (!selectedDay) return infoToast("Pick a Day first");
    setIsBusy(true);
    try {
      const res = await fetch(`${API_BASE}/subtopics/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subtopic_name: lessonName.trim(), 
          days: selectedDay, 
          level: LEVEL_ID 
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setLessonName(""); setShowLessonModal(false);
      // refresh lessons
      const params = new URLSearchParams();
      params.set("level", String(LEVEL_ID));
      if (selectedDay) params.set("days", String(selectedDay));
      const rows: LessonCard[] = await fetch(`${API_BASE}/subtopics/?${params.toString()}`).then(r => r.json());
      setLessons(rows);
      okToast("Lesson created");
    } catch { errorToast("Failed to create Lesson"); } finally { setIsBusy(false); }
  };

  const renameLesson = async (l: LessonCard) => {
    const newName = prompt("Rename Lesson", l.title) ?? "";
    if (!newName.trim()) return;
    setIsBusy(true);
    try {
      const res = await fetch(`${API_BASE}/subtopics/${l.id}/`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtopic_name: newName.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setLessons(prev => prev.map(x => x.id === l.id ? { ...x, title: newName.trim() } : x));
      okToast("Lesson renamed");
    } catch { errorToast("Failed to rename Lesson"); } finally { setIsBusy(false); }
  };

  const deleteLesson = async (id: number) => {
    setConfirm({ text: "Delete this lesson and everything inside?", onYes: async () => {
      setConfirm(null); setIsBusy(true);
      try {
        const res = await fetch(`${API_BASE}/subtopics/${id}/`, { method: "DELETE" });
        if (res.status !== 204) throw new Error();
        setLessons(prev => prev.filter(x => x.id !== id));
        if (selectedLesson === id) { setSelectedLesson(null); setContents([]); setSelectedContent(null); setMaterials([]); }
        okToast("Lesson deleted");
      } catch { errorToast("Failed to delete Lesson"); } finally { setIsBusy(false); }
    }});
  };

  // Content actions (unchanged)
  const createContent = async () => {
    if (!selectedLesson) return infoToast("Select a lesson first");
    if (!contentText.trim()) return infoToast("Enter content text");
    setIsBusy(true);
    try {
      const res = await fetch(`${API_BASE}/subtopic-contents/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtopic: selectedLesson, content: contentText.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created: SubtopicContent = await res.json();
      setContents(prev => [...prev, created]);
      setContentText(""); setShowContentModal(false);
      okToast("Content added");
    } catch { errorToast("Failed to add Content"); } finally { setIsBusy(false); }
  };

  const deleteContent = async (id: number) => {
    setConfirm({ text: "Delete this content and its materials?", onYes: async () => {
      setConfirm(null); setIsBusy(true);
      try {
        const res = await fetch(`${API_BASE}/subtopic-contents/${id}/`, { method: "DELETE" });
        if (res.status !== 204) throw new Error();
        setContents(prev => prev.filter(c => c.subtopiccontent_id !== id));
        if (selectedContent === id) { setSelectedContent(null); setMaterials([]); }
        okToast("Content deleted");
      } catch { errorToast("Failed to delete Content"); } finally { setIsBusy(false); }
    }});
  };

  // Material actions (unchanged)
  const addMaterial = async () => {
    if (!selectedContent) return infoToast("Pick a content item");
    if (!matDesc.trim()) return infoToast("Enter a description");
    const form = new FormData();
    form.append("description", matDesc.trim());
    form.append("subtopiccontent", String(selectedContent));
    if (matType === "file") {
      if (!matFile) return infoToast("Choose a file");
      form.append("training_file", matFile);
    } else {
      if (!matUrl.trim()) return infoToast("Enter a URL");
      form.append("url_link", matUrl.trim());
    }
    setIsBusy(true);
    try {
      const res = await fetch(`${API_BASE}/training-contents/`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const created: TrainingContent = await res.json();
      setMaterials(prev => [...prev, created]);
      setMatDesc(""); setMatUrl(""); setMatFile(null); setShowMaterialModal(false);
      okToast("Material added");
    } catch (e) {
      errorToast("Failed to add Material");
    } finally { setIsBusy(false); }
  };

  const deleteMaterial = async (id: number) => {
    setConfirm({ text: "Delete this material?", onYes: async () => {
      setConfirm(null); setIsBusy(true);
      try {
        const res = await fetch(`${API_BASE}/training-contents/${id}/`, { method: "DELETE" });
        if (res.status !== 204) throw new Error();
        setMaterials(prev => prev.filter(m => m.id !== id));
        okToast("Material deleted");
      } catch { errorToast("Failed to delete Material"); } finally { setIsBusy(false); }
    }});
  };

  // Filtered lessons by search
  const filteredLessons = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return lessons;
    return lessons.filter(l => l.title.toLowerCase().includes(term));
  }, [search, lessons]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Level 1 Settings
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage training structure, content, and materials in a guided flow.</p>
          </div>
          <button
            className="text-sm px-4 py-2 rounded-lg bg-white/80 backdrop-blur border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 flex items-center gap-2"
            onClick={() => setShowTips(v => !v)}
          >
            <Info size={16} />
            {showTips ? "Hide" : "Show"} Instructions
          </button>
        </div>

        {/* Instructions (updated) */}
        {showTips && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur border border-purple-200 rounded-xl p-5 text-sm">
            <div className="font-semibold mb-2 text-purple-900 flex items-center gap-2">
              <AlertCircle size={18} />
              How to use
            </div>
            <ol className="list-decimal ml-5 space-y-1.5 text-gray-700">
              <li>Select a Day (chip) to filter lessons by day.</li>
              <li>Click "+ Add Lesson" to create a lesson under the selected Day.</li>
              <li>Select a Lesson card → click "+ Add Content" to add textual content.</li>
              <li>Click a Content item → add Materials (upload file or add a link).</li>
              <li>Use Edit/Delete on cards to maintain your structure. Changes save instantly.</li>
            </ol>
            <div className="mt-3 text-xs text-purple-700 bg-purple-100/50 rounded-lg p-2">
              💡 Tip: You can search lessons, rename items inline, and open materials in new tabs.
            </div>
          </div>
        )}

        {/* Stepper (updated) */}
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-5 border border-purple-100">
          <div className="flex flex-wrap gap-4">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${s.done ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-110" : "bg-gray-200 text-gray-600"}`}>
                  {s.done ? <Check size={16} /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${s.done ? "text-purple-700" : "text-gray-600"}`}>{s.label}</span>
                {i < steps.length - 1 && (
                  <ChevronRight size={16} className="text-gray-400 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filters row (updated to remove topic) */}
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-5 space-y-4 border border-purple-100">
          {/* Day chips */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={16} />
              Days
            </h3>
            <div className="flex flex-wrap gap-2">
              {days.map(d => (
                <div key={d.days_id} className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
                  ${selectedDay === d.days_id 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  <button className="font-medium" onClick={() => setSelectedDay(selectedDay === d.days_id ? null : d.days_id)}>
                    {d.day}
                  </button>
                  <button 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110" 
                    title="Rename" 
                    onClick={() => renameDay(d)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110" 
                    title="Delete" 
                    onClick={() => deleteDay(d.days_id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input 
                  className="border border-purple-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200" 
                  placeholder="Add Day (e.g., Day 1)" 
                  value={newDay} 
                  onChange={e => setNewDay(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addDay()}
                />
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2" 
                  onClick={addDay} 
                  disabled={isBusy}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Search + Add Lesson (removed topic selector)
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-3 ml-auto">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="border border-purple-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                  placeholder="Search lessons..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowLessonModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedDay}
                title={!selectedDay ? "Pick a Day first" : "Add Lesson"}
              >
                <Plus size={16} />
                Add Lesson
              </button>
            </div>
          </div> */}
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lessons */}
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-5 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Topic
              </h2>

              {/* Search + Add Lesson (removed topic selector) */}
              <div className="flex flex-wrap items-center gap-3 border-gray-200">
                <div className="flex items-center gap-3 ml-auto">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="border border-purple-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                      placeholder="Search lessons..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setShowLessonModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedDay}
                    title={!selectedDay ? "Pick a Day first" : "Add Lesson"}
                  >
                    <Plus size={16} />
                    Add Topic
                  </button>
                </div>
              </div>
            </div>
            {filteredLessons.length === 0 ? (
              <EmptyState
                title="No lessons found"
                subtitle={selectedDay ? "Try changing filters or add a new lesson." : "Pick a Day to start adding lessons."}
                actionText={selectedDay ? "Add Lesson" : undefined}
                onAction={selectedDay ? () => setShowLessonModal(true) : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredLessons.map(l => (
                  <div
                    key={l.id}
                    className={`group border-2 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer
                      ${selectedLesson === l.id 
                        ? "border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md" 
                        : "border-gray-200 hover:border-purple-300 bg-white"}`}
                    onClick={() => setSelectedLesson(l.id)}
                  >
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar size={12} />
                      {l.day_name}
                    </div>
                    <div className="font-semibold text-gray-800 truncate mb-3">{l.title}</div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center gap-1" 
                        onClick={(e) => { e.stopPropagation(); renameLesson(l); }}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button 
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center gap-1" 
                        onClick={(e) => { e.stopPropagation(); deleteLesson(l.id); }}
                      >
                        <Delete size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lesson workspace (unchanged) */}
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-5 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                <FileText size={20} />
                Add SubTopic
              </h2>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => setShowContentModal(true)} 
                disabled={!selectedLesson}
              >
                <Plus size={16} />
                Add Content
              </button>
            </div>

            {!selectedLesson ? (
              <EmptyState
                title="No lesson selected"
                subtitle="Select a lesson on the left to manage its content and materials."
              />
            ) : (
              <div className="space-y-3">
                {contents.length === 0 && (
                  <EmptyState
                    title="No content yet"
                    subtitle="Add the first content item for this lesson."
                    actionText="Add Content"
                    onAction={() => setShowContentModal(true)}
                  />
                )}
                {contents.map(c => (
                  <div
                    key={c.subtopiccontent_id}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer
                      ${selectedContent === c.subtopiccontent_id 
                        ? "border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md" 
                        : "border-gray-200 hover:border-purple-300 bg-white"}`}
                    onClick={() => setSelectedContent(c.subtopiccontent_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-800 flex-1 mr-2">{c.content}</div>
                      <button 
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center gap-1" 
                        onClick={(e) => { e.stopPropagation(); deleteContent(c.subtopiccontent_id); }}
                      >
                        <Delete size={14} />
                      </button>
                    </div>

                    {/* Materials */}
                    {selectedContent === c.subtopiccontent_id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Link2 size={16} />
                            Materials
                          </div>
                          <button 
                            className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center gap-1" 
                            onClick={() => setShowMaterialModal(true)}
                          >
                            <Plus size={14} />
                            Add
                          </button>
                        </div>

                        {materials.length === 0 ? (
                          <div className="mt-2">
                            <EmptyState
                              title="No materials yet"
                              subtitle="Upload a file or add a web link."
                              actionText="Add Material"
                              onAction={() => setShowMaterialModal(true)}
                              compact
                            />
                          </div>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {materials.map(m => (
                              <div key={m.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors duration-200">
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-gray-800 truncate">{m.description}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    {m.url_link ? <Link2 size={12} /> : <Upload size={12} />}
                                    {m.url_link ? "Web Link" : m.training_file ? "File" : "—"}
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-2">
                                  {m.url_link && (
                                    <a 
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm" 
                                      href={m.url_link} 
                                      target="_blank" 
                                      rel="noreferrer"
                                    >
                                      Open
                                    </a>
                                  )}
                                  {m.training_file && (
                                    <a 
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm" 
                                      href={m.training_file} 
                                      target="_blank" 
                                      rel="noreferrer"
                                    >
                                      Open
                                    </a>
                                  )}
                                  <button 
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200" 
                                    onClick={() => deleteMaterial(m.id)}
                                  >
                                    <Delete size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lesson Modal (updated) */}
        {showLessonModal && (
          <Modal title="Create Lesson" onClose={() => setShowLessonModal(false)}>
            <p className="text-sm text-gray-600 mb-4">This lesson will be created under the selected Day.</p>
            <input 
              className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200" 
              placeholder="Enter lesson name..." 
              value={lessonName} 
              onChange={(e) => setLessonName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && createLesson()}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200" 
                onClick={() => setShowLessonModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200" 
                onClick={createLesson} 
                disabled={isBusy}
              >
                Create Lesson
              </button>
            </div>
          </Modal>
        )}

        {/* Content Modal (unchanged) */}
        {showContentModal && (
          <Modal title="Add Content" onClose={() => setShowContentModal(false)}>
            <textarea 
              className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 resize-none" 
              rows={4} 
              placeholder="Write your content text here..." 
              value={contentText} 
              onChange={(e) => setContentText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200" 
                onClick={() => setShowContentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200" 
                onClick={createContent} 
                disabled={isBusy}
              >
                Add Content
              </button>
            </div>
          </Modal>
        )}

        {/* Material Modal (unchanged) */}
        {showMaterialModal && (
          <Modal title="Add Material" onClose={() => setShowMaterialModal(false)}>
            <div className="space-y-4">
              <input 
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200" 
                placeholder="Material description..." 
                value={matDesc} 
                onChange={(e) => setMatDesc(e.target.value)}
                autoFocus
              />
              
              <div className="flex gap-2">
                <button 
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                    ${matType === "file" 
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`} 
                  onClick={() => setMatType("file")}
                >
                  <Upload size={16} />
                  File Upload
                </button>
                <button 
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                    ${matType === "link" 
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`} 
                  onClick={() => setMatType("link")}
                >
                  <Link2 size={16} />
                  Web Link
                </button>
              </div>

              {matType === "file" ? (
                <div
                  className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-purple-50/50 transition-all duration-200 hover:border-purple-400 hover:bg-purple-50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setMatFile(e.dataTransfer.files[0]); }}
                >
                  <Upload size={32} className="mx-auto mb-3 text-purple-400" />
                  <p className="mb-3 text-gray-600">Drag & drop a file here, or</p>
                  <input 
                    ref={fileRef} 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setMatFile(e.target.files?.[0] ?? null)} 
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mov,.avi,.mkv,.jpg,.jpeg,.png,.gif,.webp,.bmp" 
                  />
                  <button 
                    className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors duration-200" 
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose file
                  </button>
                  <div className="mt-3 text-sm text-gray-500">
                    {matFile?.name ?? "No file selected"}
                  </div>
                </div>
              ) : (
                <input 
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200" 
                  placeholder="https://example.com" 
                  value={matUrl} 
                  onChange={(e) => setMatUrl(e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200" 
                onClick={() => setShowMaterialModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200" 
                onClick={addMaterial} 
                disabled={isBusy}
              >
                Save Material
              </button>
            </div>
          </Modal>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed right-4 bottom-4 z-50 animate-slide-in">
            <div className={`px-5 py-3 rounded-lg shadow-xl text-white flex items-center gap-3
              ${toast.type === "success" ? "bg-gradient-to-r from-green-500 to-green-600" : 
                toast.type === "error" ? "bg-gradient-to-r from-red-500 to-red-600" : 
                "bg-gradient-to-r from-gray-700 to-gray-800"}`}>
              {toast.type === "success" && <Check size={20} />}
              {toast.type === "error" && <X size={20} />}
              {toast.type === "info" && <Info size={20} />}
              {toast.message}
            </div>
          </div>
        )}

        {/* Confirm */}
        {confirm && (
          <ConfirmDialog
            text={confirm.text}
            onCancel={() => setConfirm(null)}
            onConfirm={() => confirm.onYes()}
          />
        )}

        {/* Busy overlay */}
        {isBusy && (
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm pointer-events-none">
            <div className="absolute right-4 top-4 bg-white shadow-xl px-4 py-3 rounded-lg text-sm flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              Working…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======= Small UI components ======= */

function EmptyState({ title, subtitle, actionText, onAction, compact }: { title: string; subtitle?: string; actionText?: string; onAction?: () => void; compact?: boolean; }) {
  return (
    <div className={`text-center ${compact ? "py-6" : "py-12"} border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/30`}>
      <div className="text-gray-800 font-medium">{title}</div>
      {subtitle && <div className="text-gray-500 text-sm mt-1">{subtitle}</div>}
      {actionText && onAction && (
        <button 
          className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200" 
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {title}
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ text, onCancel, onConfirm }: { text: string; onCancel: () => void; onConfirm: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-scale-in">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div className="font-semibold text-lg">Please confirm</div>
          </div>
          <div className="text-gray-700 mb-6">{text}</div>
          <div className="flex justify-end gap-3">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200" 
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


