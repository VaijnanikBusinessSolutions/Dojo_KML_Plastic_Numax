import React, { useState } from "react";

// Import your components
import Sidebar from "./Curriculum/Sidebar";
import HanCurriculum from "./Curriculum/HanCurriculam"; // ✅ Consider renaming file to HanCurriculum.tsx
import HanchouExam from "./Curriculum/HanchouExam";
import AddQuestion from "./Curriculum/HanQuestion";
import ExamResultsDashboard from "./Curriculum/ExamResult";

// --- Define a reusable type for the active module ---
export type ActiveModule =
  // | "dashboard"
  | "curriculum"
  | "results"
  | "exam"
  | "AddQuestion";

// --- Props typing for child components ---
// Note: These types are for clarity. The components themselves should define their own props.
type HanchouExamProps = {
  onComplete: () => void;
};

type AddQuestionProps = {
  onAddQuestion: () => void;
  onCancel: () => void;
};

// If your components are not typed yet, you can extend them like this:
const HanchouExamTyped = HanchouExam as React.FC<HanchouExamProps>;
const AddQuestionTyped = AddQuestion as React.FC<AddQuestionProps>;

function hanchou() {
  // Use the ActiveModule type for state
  const [activeModule, setActiveModule] = useState<ActiveModule>("curriculum");

  // --- HANDLER FUNCTIONS ---
  const handleReturnToCurriculum = () => {
    console.log("Operation complete. Returning to curriculum view.");
    setActiveModule("curriculum");
  };

  // --- CONDITIONAL RENDER ---
  const renderActiveModule = () => {
    switch (activeModule) {
      // case "dashboard":
      //   return (
      //     <div>
      //       <h1>Dashboard</h1>
      //       <p>Welcome to the main dashboard.</p>
      //     </div>
      //   );

      case "curriculum":
        return <HanCurriculum />;

      case "results":
        return <ExamResultsDashboard />;

      case "exam":
        return <HanchouExamTyped onComplete={handleReturnToCurriculum} />;

      case "AddQuestion":
        return (
          <AddQuestionTyped
            onAddQuestion={handleReturnToCurriculum}
            onCancel={handleReturnToCurriculum}
          />
        );

      default:
        // A good practice for switch statements with specific types
        // const _exhaustiveCheck: never = activeModule;
        return <HanCurriculum />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
      {/* The main content area. Corrected ml-50 to ml-80 to match sidebar width */}
      <main className="flex-1 ml-80 p-4">{renderActiveModule()}</main>
    </div>
  );
}

export default hanchou;