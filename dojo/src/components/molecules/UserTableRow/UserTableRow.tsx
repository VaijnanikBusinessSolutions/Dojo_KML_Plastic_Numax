// import React from 'react';
// import { Mail, Phone, User as UserIcon } from 'lucide-react';
// import type { User } from '../../constants/types';
// import { Icon } from '../../atoms/LucidIcons/LucidIcons';
// import { StatusBadge } from '../../atoms/StatusBadge/StatusBadge';

// interface UserTableRowProps {
//   user: User;
//   onRowClick: (user: User) => void;
// }

// export const UserTableRow: React.FC<UserTableRowProps> = ({ user, onRowClick }) => {
//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//       });
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   const formatTime = (dateString: string) => {  
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//       });
//     } catch (error) {
//       return 'Invalid time';
//     }
//   };

//   // Get the latest body check (using body_checks array instead of body_check)
//   const latestCheck = user.body_checks && user.body_checks.length > 0 
//     ? user.body_checks[user.body_checks.length - 1] 
//     : null;

//   const isPassed = latestCheck && latestCheck.overall_status === 'pass';
//   const hasChecks = latestCheck !== null;
//   const isAddedToMaster = user.is_added_to_master;

//   // Updated conditional logic: onClick only works if NOT added to master AND status is pass
//   const isClickable = !isAddedToMaster && isPassed;

//   // Conditional onClick handler
//   const handleRowClick = () => {
//     if (isClickable) {
//       onRowClick(user);
//     }
//   };

//   // Updated cursor and hover styles based on clickable state
//   const getRowClasses = () => {
//     if (isAddedToMaster) {
//       return "bg-gray-50 cursor-default opacity-60";
//     } else if (isPassed) {
//       return "hover:bg-gray-50 cursor-pointer hover:shadow-sm";
//     } else {
//       // Not passed - should not be clickable
//       return "hover:bg-gray-50 cursor-default opacity-75";
//     }
//   };

//   return (
//     <tr
//       className={`transition-colors ${getRowClasses()}`}
//       onClick={handleRowClick}
//     >
//       {/* User Name Column */}
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="flex items-center">
//           {user.photo ? (
//             <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
//               <img 
//                 src={user.photo} 
//                 alt={`${user.first_name} ${user.last_name}`}
//                 className="h-full w-full object-cover"
//               />
//             </div>
//           ) : (
//             <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//               <UserIcon className="h-5 w-5 text-blue-700" />
//             </div>
//           )}
//           <div className="ml-4">
//             <div className="text-sm font-semibold text-gray-900">
//               {user.first_name} {user.last_name}
//             </div>
//             <div className="text-xs text-gray-500">{user.temp_id}</div>
//           </div>
//         </div>
//       </td>

//       {/* Photo Column - Simplified */}
//       <td className="px-6 py-4 whitespace-nowrap">
//         {user.photo ? (
//           <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
//             <img 
//               src={user.photo} 
//               alt={`${user.first_name} ${user.last_name}`}
//               className="h-full w-full object-cover"
//             />
//           </div>
//         ) : (
//           <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//             <UserIcon className="h-5 w-5 text-blue-700" />
//           </div>
//         )}
//       </td>

//       {/* Email Column */}
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//         <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
//           <Icon icon={Mail} size={14} className="mr-1" />
//           {user.email}
//         </a>
//       </td>

//       {/* Phone Column */}
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//         <a href={`tel:${user.phone_number}`} className="hover:text-blue-600 flex items-center" onClick={(e) => e.stopPropagation()}>
//           <Icon icon={Phone} size={14} className="mr-1" />
//           {user.phone_number}
//         </a>
//       </td>

//       {/* Check Date Column */}
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//         {hasChecks ? (
//           <div>
//             <div className="font-medium">{formatDate(latestCheck.check_date)}</div>
//             <div className="text-xs text-gray-500">{formatTime(latestCheck.check_date)}</div>
//           </div>
//         ) : (
//           <span className="text-gray-400">No checks</span>
//         )}
//       </td>

//       {/* Created Date Column */}
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//         <div>
//           <div className="font-medium">{formatDate(user.created_at)}</div>
//           <div className="text-xs text-gray-500">{formatTime(user.created_at)}</div>
//         </div>
//       </td>

//       {/* Status Column */}
//       <td className="px-6 py-4 whitespace-nowrap">
//         {isAddedToMaster ? (
//           <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
//             ADDED
//           </span>
//         ) : hasChecks ? (
//           <StatusBadge status={latestCheck.overall_status} />
//         ) : (
//           <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//             PENDING
//           </span>
//         )}
//       </td>
//     </tr>
//   );
// };




import React from 'react';
// 1. Import icons for the action buttons
import { Mail, Phone, User as UserIcon, Pencil, Trash2 } from 'lucide-react';
import type { User } from '../../constants/types';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';
import { StatusBadge } from '../../atoms/StatusBadge/StatusBadge';

// 2. Update the props interface to accept the new handlers
interface UserTableRowProps {
  user: User;
  onRowClick: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

// 3. Destructure the new props in the component signature
export const UserTableRow: React.FC<UserTableRowProps> = ({ user, onRowClick, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const latestCheck = user.body_checks && user.body_checks.length > 0
    ? user.body_checks[user.body_checks.length - 1]
    : null;

  const isPassed = latestCheck && latestCheck.overall_status === 'pass';
  const hasChecks = latestCheck !== null;
  const isAddedToMaster = user.is_added_to_master;

  const isClickable = !isAddedToMaster && isPassed;

  const handleRowClick = () => {
    if (isClickable) {
      onRowClick(user);
    }
  };

  const getRowClasses = () => {
    let classes = 'transition-colors';
    if (isAddedToMaster) {
      classes += " bg-gray-50 cursor-default opacity-60";
    } else if (isPassed) {
      // Add 'group' class to enable hover effects on child elements
      classes += " hover:bg-gray-50 cursor-pointer hover:shadow-sm group";
    } else {
      classes += " hover:bg-gray-50 cursor-default opacity-75 group"; // Also add group here
    }
    return classes;
  };

  // 4. Create handlers for edit and delete actions
  // These use event.stopPropagation() to stop the row's onClick from triggering
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(user);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(user.temp_id);
  };

  return (
    <tr
      className={getRowClasses()}
      onClick={handleRowClick}
    >
      {/* User Name Column */}
      {/* <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {user.photo ? (
            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
              <img src={user.photo} alt={`${user.first_name}`} className="h-full w-full object-cover"/>
            </div>
          ) : (
            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-700" />
            </div>
          )}
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</div>
            <div className="text-xs text-gray-500">{user.temp_id}</div>
          </div>
        </div>
      </td> */}

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {/* Fallback icon is now always shown */}
          {/* <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-blue-700" />
          </div> */}

          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</div>
            <div className="text-xs text-gray-500">{user.temp_id}</div>
          </div>
        </div>
      </td>

      {/* Photo Column - Simplified */}
      {/* <td className="px-6 py-4 whitespace-nowrap">
        {user.photo ? (
          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
            <img src={user.photo} alt={`${user.first_name}`} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-blue-700" />
          </div>
        )}
      </td> */}

      {/* Email Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
          <Icon icon={Mail} size={14} className="mr-1" />
          {user.email}
        </a>
      </td>

      {/* Phone Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <a href={`tel:${user.phone_number}`} className="hover:text-blue-600 flex items-center" onClick={(e) => e.stopPropagation()}>
          <Icon icon={Phone} size={14} className="mr-1" />
          {user.phone_number}
        </a>
      </td>

      {/* Check Date Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {hasChecks ? (
          <div>
            <div className="font-medium">{formatDate(latestCheck.check_date)}</div>
            <div className="text-xs text-gray-500">{formatTime(latestCheck.check_date)}</div>
          </div>
        ) : (<span className="text-gray-400">No checks</span>)}
      </td>

      {/* Created Date Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          <div className="font-medium">{formatDate(user.created_at)}</div>
          <div className="text-xs text-gray-500">{formatTime(user.created_at)}</div>
        </div>
      </td>

      {/* Status Column */}
      {/* <td className="px-6 py-4 whitespace-nowrap">
        {isAddedToMaster ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">ADDED</span>
        ) : hasChecks ? (
          <StatusBadge status={latestCheck.overall_status} />
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">PENDING</span>
        )}
      </td> */}

      <td className="px-6 py-4 whitespace-nowrap">
        {isAddedToMaster ? (
          // RULE 1: If added to master, show "ADDED" in green. This has top priority.
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">ADDED</span>
        ) : hasChecks ? (
          // RULE 3: If not mastered AND has checks, use the status from the latest check.
          <StatusBadge status={latestCheck.overall_status} />
        ) : (
          // RULE 2: If not mastered AND has NO checks, show "PENDING".
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">PENDING</span>
        )}
      </td>

      {/* 5. Add the new Actions column (<td>) */}
      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {/* The div is now always visible */}
        {/* These buttons are hidden by default and appear on row hover (`group-hover:opacity-100`) */}
        <div className="flex items-center justify-end gap-x-4">
          <button
            onClick={handleEditClick}
            // 1. Add the disabled attribute based on isAddedToMaster
            disabled={isAddedToMaster}
            // 2. Add styles for the disabled state (grayed out, no-pointer)
            className="text-indigo-600 hover:text-indigo-900 focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed"
            // 3. Add a helpful title to explain why it's disabled
            title={isAddedToMaster ? "Cannot edit a user that has been added" : "Edit User"}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-red-600 hover:text-red-900 focus:outline-none"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};