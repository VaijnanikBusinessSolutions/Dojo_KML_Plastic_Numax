import React, { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';

// Interface for a single Role object returned from the API
interface Role {
  id: number; // Assuming roles have a unique ID
  name: string;
  is_active: boolean; // Assuming roles have an active/inactive status
}

const RoleManagement: React.FC = () => {
  // State for the input field to create a new role
  const [newRoleName, setNewRoleName] = useState<string>('');
  // State to store the list of fetched roles
  const [rolesList, setRolesList] = useState<Role[]>([]);
  // State for error messages
  const [error, setError] = useState<string>('');
  // State for success messages
  const [success, setSuccess] = useState<string>('');
  // Loading state for API calls
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to fetch roles from the API
  const fetchRoles = async () => {
    setIsLoading(true);
    setError(''); // Clear previous errors
    try {
      // Adjust the URL if your API endpoint is different
      const response = await axios.get<{ roles: Role[] }>('http://172.25.0.51:8000/roles/');
      // Assuming the API returns an object with a 'roles' key containing an array
      // If it returns just the array, use response.data directly
      setRolesList(response.data.roles || response.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError('Failed to load roles. Please try again later.');
      setRolesList([]); // Clear the list on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch roles when the component mounts
  useEffect(() => {
    fetchRoles();
  }, []); // Empty dependency array means this runs once on mount

  // Handler for the new role input change
  const handleRoleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRoleName(e.target.value);
    // Clear error and success messages when the user types
    setError('');
    setSuccess('');
  };

  // Handler for form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const trimmedRoleName = newRoleName.trim();

    // --- Validation ---
    if (!trimmedRoleName) {
      setError('Role name cannot be empty.');
      setIsLoading(false);
      return;
    }
    // Example backend validation check (adjust if needed based on actual backend errors/constraints)
    if (trimmedRoleName.length > 50) {
       setError('Role name cannot exceed 50 characters.');
       setIsLoading(false);
       return;
    }
    // Add more validation as needed (e.g., disallowed characters)


    // --- API Call ---
    try {
      const response = await axios.post('http://172.25.0.51:8000/roles/', {
        name: trimmedRoleName,
        is_active: true, // Defaulting to active, adjust if your UI needs to control this
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Success Feedback
      setSuccess(`Role "${response.data.name}" created successfully!`);
      setNewRoleName(''); // Clear the input field
      await fetchRoles(); // Refresh the list of roles to include the new one

    } catch (err: any) {
      console.error("Error creating role:", err);
      // Attempt to extract a user-friendly error message
      let message = 'An unexpected error occurred while creating the role.';
      if (err.response) {
        // Backend returned an error status code
        if (err.response.data?.name?.includes('already exists')) { // Example check, adjust based on your backend error format
          message = `Role "${trimmedRoleName}" already exists.`;
        } else if (err.response.data?.detail) {
          message = err.response.data.detail; // Use specific detail if provided
        } else if (err.response.data) {
          // Try to get a generic message from the response data
          const errorMessages = Object.values(err.response.data)
            .flat() // Flatten potential arrays of errors
            .join(' '); // Join multiple errors into one string
          if (errorMessages) message = errorMessages;
        }
      } else if (err.request) {
        // Request was made but no response received
        message = 'Network error: Could not connect to the server.';
      }
      setError(message);
    } finally {
      setIsLoading(false); // Ensure loading state is turned off
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl"> {/* Increased max-width */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Role Management Settings</h2>

        {/* Display Error/Success Messages */}
        {error && <p className="text-red-500 mb-4 text-center font-medium">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-center font-medium">{success}</p>}

        {/* --- Create Role Form --- */}
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Create New Role</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-grow w-full sm:w-auto">
              <label htmlFor="newRoleNameInput" className="block text-gray-700 text-sm font-medium mb-1">
                Role Name
              </label>
              <input
                id="newRoleNameInput"
                type="text"
                name="newRoleName"
                value={newRoleName}
                onChange={handleRoleNameChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                placeholder="Enter role name (e.g., Admin, Manager)"
                maxLength={50} // Enforce max length client-side
                aria-label="New Role Name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !newRoleName.trim()} // Disable if loading or input is empty after trimming
            >
              {isLoading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>

        {/* --- Existing Roles List --- */}
        <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Existing Roles</h3>

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <p className="text-blue-500 animate-pulse">Loading roles...</p>
            </div>
          )}

          {!isLoading && rolesList.length === 0 && !error && (
            <p className="text-center text-gray-500 py-8">No roles have been created yet.</p>
          )}

          {!isLoading && rolesList.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200 rounded-md overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {/* Add other columns like Actions if needed later */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rolesList.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold leading-5 rounded-full ${role.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Example Action buttons placeholder:
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                    */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;