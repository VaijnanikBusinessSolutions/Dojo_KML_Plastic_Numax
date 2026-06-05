import React, { type JSX, useState } from "react";

// Import your components
import ShokuchouCurriculum from './Curriculum/ShokuchouCurriculum';
import ShoSidebar from './Curriculum/ShoSidebar';
import ShokuchouExamComponent from './Curriculum/ShokuchouExam'; // Renamed import to avoid conflict
import AddQuestionComponent from './Curriculum/ShoQuetions';     // Renamed import to avoid conflict
import ShokuchouExamResult from './Curriculum/ShokuchouExamResult';

// --- Define and EXPORT the reusable type for the active module ---
export type ActiveModule =
  // | "dashboard"
  | "curriculum"
  | "results"
  | "exam"
  | "AddQuestion";

// --- Props typing for child components ---
// This is a good practice for ensuring the props you pass are correct.
type ShokuchouExamProps = {
  onComplete: () => void;
};

type AddQuestionProps = {
  onAddQuestion: () => void;
  onCancel: () => void;
};

// If your child components are not typed, you can cast them like this.
const ShokuchouExam = ShokuchouExamComponent as React.FC<ShokuchouExamProps>;
const AddQuestion = AddQuestionComponent as React.FC<AddQuestionProps>;


// Component name should be PascalCase (e.g., App)
function App() {
  // Use the ActiveModule type for state
  const [activeModule, setActiveModule] = useState<ActiveModule>("curriculum");

  // --- HANDLER FUNCTIONS ---
  const handleReturnToCurriculum = (): void => {
    console.log("Operation complete. Returning to curriculum view.");
    setActiveModule("curriculum");
  };

  // --- CONDITIONAL RENDER ---
  const renderActiveModule = (): JSX.Element => {
    switch (activeModule) {
      case "curriculum":
        return <ShokuchouCurriculum />;

      case "results":
        return <ShokuchouExamResult />;

      case "exam":
        return <ShokuchouExam onComplete={handleReturnToCurriculum} />;

      case "AddQuestion":
        return (
          <AddQuestion
            onAddQuestion={handleReturnToCurriculum}
            onCancel={handleReturnToCurriculum}
          />
        );

      // Default case now correctly handles any unhandled ActiveModule types
      default:
        // This line will cause a TypeScript error if you add a new module to ActiveModule
        // but forget to add a `case` for it here. It's a great safety check.
        // const _exhaustiveCheck: never = activeModule;
        return <ShokuchouCurriculum />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ShoSidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
      {/* Changed ml-50 to ml-64 (a standard Tailwind class, adjust as needed) */}
      <main className="flex-1 ml-54 p-4">{renderActiveModule()}</main>
    </div>
  );
}

export default App;