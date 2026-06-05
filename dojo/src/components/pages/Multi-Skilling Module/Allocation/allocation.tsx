import MultiSkillNav from "../mutliSkillNavbar/MultiSkillNav";
import EmployeeSearch from "./SearchBar/EmployeeSearch";


const Allocation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <MultiSkillNav />

      {/* Main Content */}
      <main className="max-w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <EmployeeSearch />
        </div>
      </main>
    </div>
  );
};

export default Allocation;