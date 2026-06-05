import React, { useState, type ChangeEvent } from 'react';
import { X } from 'lucide-react';

interface Employee {
  full_name: string;
  employee_code: string;
}

interface EmployeeShowMoreProps {
  employees: Employee[];
}

const EmployeeShowMore: React.FC<EmployeeShowMoreProps> = ({ employees }) => {
  /* ---------- preview logic ---------- */
  const previewCount = 2;
  const previewEmployees = employees.slice(0, previewCount);
  const hasMore = employees.length > previewCount;

  /* ---------- modal state ---------- */
  const [isModalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const filteredEmployees = employees.filter(({ full_name, employee_code }) =>
    `${full_name} ${employee_code}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  return (
    <>
      {/* ----------- preview cell (table) ----------- */}
      <div className="text-sm text-black">
        {previewEmployees.map((emp, idx) => (
          <span key={idx}>
            {emp.full_name}
            {idx < previewEmployees.length - 1 ? ', ' : ''}
          </span>
        ))}

        {hasMore && (
          <>
            {previewEmployees.length ? ',' : ''}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="ml-1 text-blue-600 hover:underline text-xs"
            >
              Show all
            </button>
          </>
        )}
      </div>

      {/* ----------- modal ------------ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg relative">
            {/* close btn */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* title */}
            <h3 className="text-lg font-semibold mb-4 text-black">
              Employee List ({employees.length})
            </h3>

            {/* search bar */}
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by code or name..."
              className="w-full mb-3 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:ring-blue-300"
            />

            {/* list */}
            <ul className="max-h-96 overflow-y-auto text-sm space-y-1 text-black">
              {filteredEmployees.length ? (
                filteredEmployees.map(({ full_name, employee_code }, idx) => (
                  <li key={idx} className="border-b py-1">
                    {full_name} <span className="text-gray-500">({employee_code})</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No matches</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeShowMore;
