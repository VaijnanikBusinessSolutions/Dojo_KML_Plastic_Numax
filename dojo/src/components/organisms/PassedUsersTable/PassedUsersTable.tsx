



// In PassedUsersTable.tsx

import React, { useEffect, useState } from 'react';
// FIX: Removed unused 'Pencil' and 'Trash2' imports
import { Filter, Calendar, Users } from 'lucide-react'; 
import type { User } from '../../constants/types';
import { API_ENDPOINTS } from '../../constants/api';
// import { LoadingSpinner } from '../../atoms/LoadingSpinner/LoadingSpinner';
import { ErrorDisplay } from '../../molecules/ErrorDisplay/ErrorDisplay';
import Level0Nav from '../../molecules/Level0Nav/Level0Nav';
import { SearchBar } from '../../molecules/SearchBar/SearchBar';
import { FilterDropdown } from '../../molecules/FilterDropdown/FilterDropdown';
import { UserTableRow } from '../../molecules/UserTableRow/UserTableRow';
import { EmptyState } from '../../molecules/EmptyState/EmptyState';
import OrientationFeedbackModal from '../OrientationFeedbackModal/OrientationFeedbackModal';
import { PageHeader } from '../../atoms/PageHeader/PageHeader';
import EditUserModal from './EditUserModalProps';

const PassedUsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'added', label: 'Added to Master' },
    { value: 'pending', label: 'Pending' },
    { value: 'pass', label: 'Pass' },
    { value: 'fail', label: 'Fail' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const fetchData = async (tempId?: string) => {
    // ... no changes needed in this function ...
    try {
      let url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ALL_PASSED_USERS}`;
      if (tempId) {
        url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PASSED_USER_BY_ID(tempId)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : [data]);
      setFilteredUsers(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // FIX: Moved 'now' declaration to the top of the hook so it's always available.
    const now = new Date(); 
    let filtered = [...users];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        const latestCheck = user.body_checks?.length > 0 ? user.body_checks[user.body_checks.length - 1] : null;

        if (statusFilter === 'added') {
          return user.is_added_to_master === true;
        }

        if (user.is_added_to_master) {
          return false;
        }

        if (statusFilter === 'pending') {
          // This line will work now that the BodyCheck type is updated.
          return !latestCheck || latestCheck.overall_status === 'pending';
        }

        if (!latestCheck) {
          return false;
        }
        return latestCheck.overall_status === statusFilter;
      });
    }

    // All date filtering will work now that 'now' is defined in the correct scope.
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(user => {
          const latestBodyCheck = user.body_checks?.length > 0
            ? user.body_checks[user.body_checks.length - 1]
            : null;
          if (!latestBodyCheck) return false;
          const checkDate = new Date(latestBodyCheck.check_date);
          return (
            checkDate.getDate() === now.getDate() &&
            checkDate.getMonth() === now.getMonth() &&
            checkDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        filtered = filtered.filter(user => {
          const latestBodyCheck = user.body_checks?.length > 0
            ? user.body_checks[user.body_checks.length - 1]
            : null;
          if (!latestBodyCheck) return false;
          const checkDate = new Date(latestBodyCheck.check_date);
          return checkDate >= startOfWeek && checkDate <= now;
        });
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(user => {
          const latestBodyCheck = user.body_checks?.length > 0
            ? user.body_checks[user.body_checks.length - 1]
            : null;
          if (!latestBodyCheck) return false;
          const checkDate = new Date(latestBodyCheck.check_date);
          return checkDate >= startOfMonth && checkDate <= now;
        });
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter(user => {
          const latestBodyCheck = user.body_checks?.length > 0
            ? user.body_checks[user.body_checks.length - 1]
            : null;
          if (!latestBodyCheck) return false;
          const checkDate = new Date(latestBodyCheck.check_date);
          return checkDate >= startOfYear && checkDate <= now;
        });
        break;
      default:
        break;
    }

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [dateFilter, statusFilter, users, searchTerm]);


  // ... The rest of the component (handlers and JSX) is correct and does not need changes ...

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  
  const handleEditUser = async (userToEdit: User) => {
    const idToFetch = userToEdit.temp_id || userToEdit.temp_id;
    if (!idToFetch) {
      console.error("Could not find ID on user object:", userToEdit);
      return;
    }
    setIsDetailLoading(true);
    setIsEditModalOpen(true);
    setSelectedUser(userToEdit);
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/users/${idToFetch}/`);
      if (!response.ok) throw new Error('Failed to fetch user details.');
      const apiResponseData: any = await response.json();
      const formattedUser: User = {
        ...apiResponseData, 
        first_name: apiResponseData.firstName,
        last_name: apiResponseData.lastName,
        phone_number: apiResponseData.phoneNumber,
        employment_type: apiResponseData.employmentType,
        temp_id: apiResponseData.tempId 
      };
      setSelectedUser(formattedUser);
    } catch (err) {
      console.error(err);
      setIsEditModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
    if (isConfirmed) {
      try {
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}/users/${userId}/`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete user.');
        }
        setUsers(currentUsers => currentUsers.filter(user => user.temp_id !== userId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not delete user.');
      }
    }
  };


  if (loading) {
    // return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <>
      <Level0Nav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Employee Details"
            subtitle="Manage and view employee information and body check results"
            icon={<Users className="h-5 w-5 text-gray-400" />}
          />

          <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Employee List</h2>
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                  <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                  <FilterDropdown
                    title="Status Filter"
                    currentValue={statusFilter}
                    options={statusOptions}
                    onSelect={setStatusFilter}
                    isOpen={showStatusDropdown}
                    setIsOpen={setShowStatusDropdown}
                    icon={Filter}
                  />
                  <FilterDropdown
                    title="Date Filter"
                    currentValue={dateFilter}
                    options={dateOptions}
                    onSelect={setDateFilter}
                    isOpen={showDateDropdown}
                    setIsOpen={setShowDateDropdown}
                    icon={Calendar}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Photo</th> */}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <UserTableRow
                      key={user.temp_id}
                      user={user}
                      onRowClick={handleRowClick}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <EmptyState hasUsers={users.length > 0} />
            )}
          </div>

          {showModal && selectedUser && (
            <OrientationFeedbackModal
              user={selectedUser}
              onClose={() => setShowModal(false)}
              onSave={() => {
                setShowModal(false);
                fetchData();
              }}
            />
          )}
          {isEditModalOpen && (
            <EditUserModal
              isLoading={isDetailLoading}
              user={selectedUser}
              onClose={() => setIsEditModalOpen(false)}
              onSave={() => {
                fetchData();
                setIsEditModalOpen(false);
              }}
            />
          )}
        </div>
      </div >
    </>
  );
};

export default PassedUsersTable;