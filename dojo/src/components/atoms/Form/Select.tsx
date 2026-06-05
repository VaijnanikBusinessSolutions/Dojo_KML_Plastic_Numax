// src/components/atoms/Form/Select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select {...props} className="w-full mt-1 p-2 border rounded-md bg-white disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm">
            <option value="">Select {label}...</option>
            {children}
        </select>
    </div>
);

export default Select;