import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiCheck, FiX, FiImage, FiUpload } from 'react-icons/fi';
import { LEVEL_CHOICES } from '../../../pages/Machine/types';
import type { Machine, Operation, Department } from '../../../pages/Machine/types';

// Station type based on your Station model
type Station = {
  station_id: number;
  station_name: string;
  subline?: any;
  line?: any;
  department?: any;
  factory?: any;
  hq?: any;
};

type Props = {
  formData: Partial<Machine>;
  imageFile: File | null;
  operations?: Operation[]; // Made optional for backward compatibility
  departments: Department[];
  isEditing: boolean;
  isSubmitting?: boolean;
  useStations?: boolean; // Flag to determine whether to use stations or operations
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

const MachineForm: React.FC<Props> = ({
  formData,
  imageFile,
  operations = [],
  departments,
  isEditing,
  isSubmitting,
  useStations = true, // Default to using stations
  onInputChange,
  onFileChange,
  onSubmit,
  onCancel,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Handle department change and fetch stations for that department
  const handleDepartmentChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const departmentId = e.target.value;
    setSelectedDepartment(departmentId);
    
    // Call the original onInputChange to update formData
    onInputChange(e);
    
    // Reset process field when department changes
    const processResetEvent = {
      target: {
        name: 'process',
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
    onInputChange(processResetEvent);
    
    // Fetch stations for the selected department
    if (useStations && departmentId) {
      await fetchStationsByDepartment(parseInt(departmentId));
    } else {
      setStations([]); // Clear stations if no department selected
    }
  };

  // Fetch stations by department ID using hierarchy endpoint
  const fetchStationsByDepartment = async (departmentId: number) => {
    setLoadingStations(true);
    setStationsError(null);
    
    try {
      // Try different possible API base URLs
      const possibleBaseUrls = [
        '/api',
        '',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:8000'
      ];
      
      let response;
      let lastError;
      
      for (const baseUrl of possibleBaseUrls) {
        try {
          const url = `${baseUrl}/hierarchy/by-department/?department_id=${departmentId}`;
          console.log(`Trying to fetch hierarchy from: ${url}`);
          
          response = await fetch(url);
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              break; // Found a working endpoint
            } else {
              console.warn(`${url} returned non-JSON content: ${contentType}`);
              continue;
            }
          } else {
            console.warn(`${url} returned status: ${response.status}`);
            if (response.status === 404) {
              // Try next URL
              continue;
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch from ${baseUrl}/hierarchy/by-department/:`, err);
          lastError = err;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error(`No hierarchy found for department ID: ${departmentId}`);
      }
      
      const data = await response.json();
      console.log('Fetched hierarchy for department:', data);
      
      // Extract all stations from the hierarchy structure
      const allStations: Station[] = [];
      
      // Stations directly under department
      if (data.stations && Array.isArray(data.stations)) {
        allStations.push(...data.stations);
      }
      
      // Stations under lines
      if (data.lines && Array.isArray(data.lines)) {
        data.lines.forEach((line: any) => {
          // Stations directly under line
          if (line.stations && Array.isArray(line.stations)) {
            allStations.push(...line.stations.map((station: any) => ({
              ...station,
              line_info: { line_id: line.line_id, line_name: line.line_name }
            })));
          }
          
          // Stations under sublines of this line
          if (line.sublines && Array.isArray(line.sublines)) {
            line.sublines.forEach((subline: any) => {
              if (subline.stations && Array.isArray(subline.stations)) {
                allStations.push(...subline.stations.map((station: any) => ({
                  ...station,
                  line_info: { line_id: line.line_id, line_name: line.line_name },
                  subline_info: { subline_id: subline.subline_id, subline_name: subline.subline_name }
                })));
              }
            });
          }
        });
      }
      
      // Stations under sublines (not under any line)
      if (data.sublines && Array.isArray(data.sublines)) {
        data.sublines.forEach((subline: any) => {
          if (subline.stations && Array.isArray(subline.stations)) {
            allStations.push(...subline.stations.map((station: any) => ({
              ...station,
              subline_info: { subline_id: subline.subline_id, subline_name: subline.subline_name }
            })));
          }
        });
      }
      
      console.log('Extracted stations:', allStations);
      
      if (allStations.length > 0) {
        setStations(allStations);
        setStationsError(null);
      } else {
        setStations([]);
        setStationsError(`No stations found under ${data.department_name || 'selected department'}`);
      }
      
    } catch (error) {
      console.error('Error fetching stations:', error);
      setStationsError(error instanceof Error ? error.message : 'Failed to fetch stations');
      setStations([]);
    } finally {
      setLoadingStations(false);
    }
  };

  // Initialize department and fetch stations on component mount (for edit mode)
  useEffect(() => {
    const departmentId = (formData as any).department;
    if (departmentId && useStations) {
      setSelectedDepartment(departmentId.toString());
      fetchStationsByDepartment(parseInt(departmentId));
    }
  }, [formData.department, useStations]);

  useEffect(() => {
    if (!imageFile) return setPreview(null);
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('image/')) {
      const event = {
        target: { files: [files[0]] }
      } as React.ChangeEvent<HTMLInputElement>;
      onFileChange(event);
    }
  };

  // Determine what data to use for the process dropdown
  const processOptions = useStations ? stations : operations;
  const isLoadingProcess = useStations ? loadingStations : false;
  const processError = useStations ? stationsError : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <div className="absolute inset-0 bg-black/5"></div>
        <h2 className="relative flex items-center text-xl font-bold text-white">
          {isEditing ? (
            <>
              <div className="mr-3 rounded-lg bg-white/20 p-2">
                <FiEdit2 className="h-5 w-5" />
              </div>
              Edit Machine
            </>
          ) : (
            <>
              <div className="mr-3 rounded-lg bg-white/20 p-2">
                <FiPlus className="h-5 w-5" />
              </div>
              Add New Machine
            </>
          )}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Department */}
            <div className="group">
              <label htmlFor="department" className="mb-3 block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-blue-600">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="department"
                  name="department"
                  value={(formData as any).department ?? ''}
                  onChange={handleDepartmentChange}
                  className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="group">
              <label htmlFor="name" className="mb-3 block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-blue-600">
                Machine Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={onInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                placeholder="Enter machine name..."
                required
              />
            </div>

            {/* Level */}
            <div className="group">
              <label htmlFor="level" className="mb-3 block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-blue-600">
                Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="level"
                  name="level"
                  value={formData.level ?? ''}
                  onChange={onInputChange}
                  className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  required
                >
                  {LEVEL_CHOICES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Process (Dynamic: Station or Operation) */}
            <div className="group">
              <label htmlFor="process" className="mb-3 block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-blue-600">
                {useStations ? 'Process (Station)' : 'Process (Operation)'}
                {useStations && !selectedDepartment && (
                  <span className="ml-2 text-xs text-gray-500">(Select department first)</span>
                )}
              </label>
              <div className="relative">
                <select
                  id="process"
                  name="process"
                  value={formData.process ?? ''}
                  onChange={onInputChange}
                  className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  disabled={isLoadingProcess || (useStations && !selectedDepartment)}
                >
                  <option value="">
                    {isLoadingProcess 
                      ? 'Loading stations...' 
                      : useStations && !selectedDepartment
                      ? 'Select department first'
                      : `Select ${useStations ? 'Station' : 'Operation'}`
                    }
                  </option>
                  {processOptions.map((item: any) => {
                    if (useStations) {
                      // Handle Station objects from hierarchy
                      const station = item as Station & {
                        line_info?: { line_id: number; line_name: string };
                        subline_info?: { subline_id: number; subline_name: string };
                      };
                      
                      let displayName = station.station_name;
                      
                      // Build hierarchical display name
                      if (station.subline_info && station.line_info) {
                        displayName += ` (${station.line_info.line_name} → ${station.subline_info.subline_name})`;
                      } else if (station.line_info) {
                        displayName += ` (${station.line_info.line_name})`;
                      } else if (station.subline_info) {
                        displayName += ` (${station.subline_info.subline_name})`;
                      }
                      
                      return (
                        <option key={station.station_id} value={station.station_id}>
                          {displayName}
                        </option>
                      );
                    } else {
                      // Handle Operation objects
                      const operation = item as Operation;
                      return (
                        <option key={operation.id} value={operation.name}>
                          {operation.name}
                        </option>
                      );
                    }
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {processError && (
                <p className="mt-2 text-sm text-amber-600">
                  {processError}
                </p>
              )}
              {useStations && selectedDepartment && stations.length > 0 && (
                <p className="mt-2 text-sm text-green-600">
                  Found {stations.length} station{stations.length !== 1 ? 's' : ''} in selected department
                </p>
              )}
              {!useStations && (
                <p className="mt-2 text-sm text-gray-500">
                  Currently using static operations data
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="flex flex-col">
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Machine Image
            </label>
            <div className="flex-1">
              <label
                className={`group relative flex h-full min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50/80'
                    : preview
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="relative h-full w-full">
                    <img src={preview} alt="preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                      <div className="flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="rounded-lg bg-white/90 p-3">
                          <FiUpload className="h-6 w-6 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4 p-8 text-center">
                    <div className="rounded-full bg-blue-100 p-4">
                      <FiImage className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-700">
                        {isDragOver ? 'Drop image here' : 'Upload machine image'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Drag & drop or click to browse
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  id="image"
                  type="file"
                  className="hidden"
                  onChange={onFileChange}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              <FiX className="h-4 w-4 transition-transform group-hover:scale-110" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || isLoadingProcess}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <FiCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
                {isEditing ? 'Update Machine' : 'Save Machine'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MachineForm;