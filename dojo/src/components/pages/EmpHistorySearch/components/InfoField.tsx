// src/components/pages/EmployeeHistorySearch/components/InfoField.tsx
import React from 'react';

interface InfoFieldProps {
  label: string;
  value: string | null | undefined;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
	<div className='flex items-start bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl hover:shadow-md transition-all duration-200'>
		<span className='text-gray-600 font-semibold text-base w-32'>{label}:</span>
		<span className='font-bold text-lg text-gray-800 flex-1'>{value || "N/A"}</span>
	</div>
);

export default InfoField;