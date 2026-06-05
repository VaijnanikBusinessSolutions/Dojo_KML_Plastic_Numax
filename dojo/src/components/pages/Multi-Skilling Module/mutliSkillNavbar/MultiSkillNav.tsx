import { Link, useLocation } from "react-router-dom";
import { FaUser, FaCalendar, FaBell } from "react-icons/fa";

const MultiSkillNav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Allocation", path: "/allocation", icon: <FaUser className="mr-2" /> },
    { name: "Scheduling", path: "/scheduling", icon: <FaCalendar className="mr-2" /> },
    { name: "Notifications", path: "/multinotification", icon: <FaBell className="mr-2" size={16} /> },
  ];

  return (
    <nav className="bg-gray-50 pt-4">
      <div className="mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16">
          
          {/* Title section */}
          <div className="flex flex-col justify-center">
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              Multi-Skilling Module
            </span>
            <span className="text-sm text-gray-500">
              Employee Skill Management System
            </span>
          </div>

          {/* Navigation links */}
          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  {item.icon}
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

export default MultiSkillNav;