// src/components/pages/EmployeeHistorySearch/components/EmployeeInfoCard.tsx
import React from 'react';
// import { MasterEmployee } from '../types';
import type { MasterEmployee } from '../types';
import InfoField from './InfoField';

interface EmployeeInfoCardProps {
    employee: MasterEmployee;
}

const EmployeeInfoCard: React.FC<EmployeeInfoCardProps> = ({ employee }) => {
    const displayName = [employee.first_name, employee.last_name].filter(Boolean).join(" ");

    return (
        <div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-3xl transition-shadow duration-300'>
            <div className='flex items-center mb-6'>
                <div className='bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl mr-4 shadow-lg'>
                    <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                </div>
                <h2 className='text-3xl font-bold text-gray-800'>
                    Employee Information
                </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                    <InfoField label='Name' value={displayName} />
                    <InfoField label='Emp ID' value={employee.emp_id} />
                    {/* <InfoField label='Guardian' value={employee.guardian_name} /> */}
                    <InfoField label='Gender' value={employee.sex} />
                    <InfoField label='Birth Date' value={employee.birth_date} />

                </div>
                <div className='space-y-4'>
                    <InfoField label='Department' value={employee.department} />
                    {/* <InfoField label='Section' value={employee.section} /> */}
                    {/* <InfoField label='Designation' value={employee.desig_category} /> */}
                    <InfoField label='Joining Date' value={employee.date_of_joining} />
                    {/* <InfoField label='Pay Code' value={employee.pay_code} /> */}
                    <InfoField label='Email' value={employee.email} />
                    <InfoField label='Phone' value={employee.phone} />
                </div>
            </div>
        </div>
    );
};

export default EmployeeInfoCard;