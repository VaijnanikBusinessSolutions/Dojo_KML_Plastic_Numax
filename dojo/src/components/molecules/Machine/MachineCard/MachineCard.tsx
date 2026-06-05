
// src/components/molecules/Machine/MachineCard/MachineCard.tsx
import React from 'react';
import { FiImage, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { API_ENDPOINTS } from '../../../constants/api';
import type { Machine } from '../../../pages/Machine/types';
import { MdFingerprint } from 'react-icons/md';

type Props = {
  machine: Machine;
  onEdit: (m: Machine) => void;
  onDelete: (id: number) => void;
};

const MachineCard: React.FC<Props> = ({ machine, onEdit, onDelete }) => {
  const imgSrc =
    machine.image && machine.image.startsWith('http')
      ? machine.image
      : machine.image
      ? `${API_ENDPOINTS.BASE_URL}${machine.image}`
      : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="h-44 w-full overflow-hidden rounded-t-lg bg-gray-100">
        {imgSrc ? (
          <img src={imgSrc} alt={machine.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <FiImage className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{machine.name}</h3>
          <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            Level {machine.level}
          </span>
        </div>

        {machine.process && (
          <p className="text-sm text-gray-600">
            {/* <span className="font-medium">Process:</span> {machine.process} */}
            <span className="font-medium">Skill :</span> {machine.process_name}
          </p>
        )}

        {/* NEW: Device Indicator  Numax easytimepro*/}
        <div className='flex'>
          {machine.biometric_device && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-1">
                  {/* <FiCpu /> */}
                  <MdFingerprint />
                  <span className="font-medium truncate">
                      : {machine?.biometric_device_name || "Device Connected"}
                      {/* {machine.biometric_device_name || "Device Connected"} */}
                      {/* {machine.biometric_device || "Device Connected"} */}
                  </span>
              </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={() => onEdit(machine)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
            <FiEdit2 /> Edit
          </button>
          <button onClick={() => onDelete(machine.id)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineCard;
