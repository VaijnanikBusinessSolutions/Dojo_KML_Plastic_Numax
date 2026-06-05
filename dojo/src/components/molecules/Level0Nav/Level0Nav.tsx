import { Link, useLocation } from "react-router-dom";
import { Calendar, UserCheck, Table } from "lucide-react";
import { Icon } from "../../atoms/LucidIcons/LucidIcons";

const Level0Nav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Add New User", path: "/Level0", icon: Calendar },
    { name: "Employee Search", path: "/TempEmployeeSearch", icon: UserCheck },
    { name: "Employee Details", path: "/PassedUsersTable", icon: Table },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Title */}
          <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Level 0 Dashboard
          </div>

          {/* Nav Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-blue-500 hover:shadow-md hover:scale-105"
                  }`}
                >
                  <Icon icon={item.icon} className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Level0Nav;
