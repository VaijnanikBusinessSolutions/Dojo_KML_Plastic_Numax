import { useState } from "react";

type ManpowerActionsProps = {
  title: string;
  data: string[];
};

const ManpowerActions: React.FC<ManpowerActionsProps> = ({ title, data }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full border border-gray-800 rounded overflow-hidden bg-white">
      <div
        className="bg-gray-900 text-white px-4 py-2 font-bold flex justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="max-h-44 overflow-y-auto scrollbar-hide">
          {data.map((action, index) => (
            <div
              key={index}
              className={`px-4 py-2 transition duration-300 ${
                index % 2 === 0
                  ? "bg-blue-300 text-black"
                  : "bg-blue-600 text-white"
              }`}
            >
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManpowerActions;
