import { useState } from 'react';
import Sidebar from './Components/Sidebar';
import Scheduling from './Components/Scheduling';
import CalendarOverview from './Components/CalendarOverview';
import Notification from './Components/Notification';
import Training from './Components/Training';
import Curriculum from './Components/Curriculum';
import Status from './Components/Status';



function App() {
  const [activeModule, setActiveModule] = useState('scheduling');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | string | null>(null);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'scheduling':
        return <Scheduling />;
      case 'calendar':
        return <CalendarOverview />;
      case 'notification':
        return <Notification />;
      case 'training':
        return (
          <Training 
            setActiveModule={setActiveModule} 
            setSelectedCategoryId={setSelectedCategoryId} 
            setSelectedTopicId={setSelectedTopicId} 
          />
        );
      case 'curriculum':
        return (
          <Curriculum 
            selectedCategoryId={selectedCategoryId} 
            selectedTopicId={selectedTopicId} 
            setSelectedCategoryId={setSelectedCategoryId} 
            setSelectedTopicId={setSelectedTopicId} 
          />
        );
      case 'status':
        return <Status />;
      default:
        return <Scheduling />;
    }
  };

  return (
     // The top-level div is a flex container for the sidebar and main content.
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

      {/* 
       * KEY CHANGE:
       * - Removed: `ml-64` (no longer needed as this is a flex item)
       * The `flex-1` class makes this main content area fill the remaining horizontal space.
       */}
      <main className="flex-1 p-8">
        {renderActiveModule()}
      </main>
    </div>
  );
}

export default App;