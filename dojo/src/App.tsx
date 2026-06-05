import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/pages/Layout/MainLayout';
import { HomePage } from './components/pages/Homepage/Home'
import Planning from './components/pages/Planning/Planning'
import MachinesPage from './components/pages/Machine/Machines'
import MachineAllocationsPage from './components/pages/Machine/MachineAllocations'
import Report from './components/pages/Report/Report';
import { LoginPage } from './components/pages/LoginPage/LoginPage';
import Level0 from './components/pages/Level0/Level0';
import TempEmployeeSearch from './components/organisms/TempEmployeeSearch/TempEmployeeSearch';

import PassedUsersTable from './components/organisms/PassedUsersTable/PassedUsersTable';
import MasterTable from './components/pages/MasterTable/MasterTable';
import ProcessDojo from './components/pages/ProcessDojo/ProcessDojo';
import Level2 from './components/organisms/Level2/Level2';
import MethodPage from './components/pages/method/MethodPage';
import SkillMatrixPage from './components/pages/Skillmatrix/pages/SkillMatrixPage';
import Allocation from './components/pages/Multi-Skilling Module/Allocation/allocation';
import MultiNotification from './components/pages/Multi-Skilling Module/MultiSkil-Notification/notification';
import RefreshmentTraining from './components/pages/RefreshmentTraining/Refreshment';
import Retraining from './components/pages/Retraining/Retraining';
import EmployeeHistorySearch from './components/pages/EmpHistorySearch/index';
import Plan from './components/pages/Planning/plan';
import ProductionPlanList from './components/pages/Planning/planlist';
import Level3 from './components/organisms/Level3/Level3';
import Level4 from './components/organisms/Level4/Level4';
import TrainingOptionsPage from './components/organisms/TrainingOptionsPage/TrainingOptionsPage';
import RequireAuth from './components/routing/RequireAuth';
import QuestionUpload from './components/pages/Question upload/questionupload';
import Management from './components/pages/ManagementDashboard/management';
import QuestionPaperSetting from './components/pages/Question upload/Questionpapersetting';
import Hanchou from './components/pages/Hanchou/hanchou';
import Shokuchou from './components/pages/Shokuchou/Shokuchou';
import Anlitics from './components/pages/analytics/index';
import ExamModeSelector from './components/pages/Evaluvation/ExamModeSelector';
import RemoteQuiz from './components/pages/Evaluvation/RemoteQuiz';
import QuestionForm from './components/pages/Evaluvation/QuestionForm';
import AssignEmployees from './components/pages/Evaluvation/AssignEmployees';
import InstructionsPage from './components/pages/Evaluvation/InstructionsPage';
import TestEnded from './components/pages/Evaluvation/TestEnded';
import QuizResults from './components/pages/Evaluvation/QuizResults';
import IndividualQuiz from './components/pages/Evaluvation/IndividualQuiz';
import OjtSearch from './components/organisms/OjtSearch/OjtSearch';
import OJTForm from './components/pages/OJTForm/OJTForm';
import Approvallist from './components/pages/Approvallist/Approvallist';
import Level1 from './components/pages/Level1/Level1';
import Level1Detailed from './components/pages/Level1/Level1Detailed/Level1Detailed';
import TenCycleMethodPage from './components/pages/TenCycle/TenCycleMethodPage';
import Level1Settings from './components/pages/Level1/Level1Settings/Level1method'
import Roles from './components/pages/Roles/Roles';
import DojoDetail from './components/pages/DojoDetail/DojoDetail'
import TenCyclePage from './components/pages/TenCycle/TencyclePage';
import Advance from './components/pages/AdvanceManPower/advanced';
import Advanced from './components/pages/AdvancedManPower/advanced';
import MachineAllocationList from './components/pages/Machine/MachineAllocationList';
import SimpleContentPage from './components/pages/SimpleContentPage/SimpleContentPage';
import { PROCESSDOJONEW } from './components/pages/PROCESSDOJONEW/PROCESSDOJONEW';
import AppNotification from './components/pages/Notifications/notification';
import HandOverSheet from './components/pages/Level1/HandOverSheet/HandOverSheet';
import { Levelwise } from './components/pages/Levelwise/Levelwise';
import TrainingOptionsPageNew from './components/organisms/TrainingOptionsPageNew/TrainingOptionsPageNew';
import PrivacyPolicy from './components/organisms/PrivacyPolicy/PrivacyPolicy';
import PrivacyPolicyVersionControl from './components/organisms/PrivacyPolicyVersionControl/PrivacyPolicyVersionControl';
import TermsAndConditions from './components/organisms/TermsAndConditions/TermsAndConditions';
import ProductionDataTable from './components/pages/ProductionDataTable/ProductionDataTable';
import ArVrComponent from './components/pages/ArVrComponent/ArVrComponent';
import AttendancePage from './components/pages/Level1/Level1Detailed/AttendancePage';
import TrainingFeedbackForm from './components/pages/Level1/sdc';
import OJTStatusList from './components/pages/OJTForm/OJTStatusList';
import Scheduling from './components/pages/Multi-Skilling Module/Scheduling/scheduling';
import Dashboard from './components/pages/ObservanceSheet/components/Dashboard';
import AnswerSheetView from './components/pages/Evaluvation/AnswerSheetView';
import ResultsMatrixView from './components/pages/Evaluvation/ResultsMatrixView';
import TenCycleStatusList from './components/pages/TenCycle/TenCycleStatusList';
import ScrollToTop from './components/hooks/ScrollTop';
import EasyTimeDashboard from './components/pages/BiometricSystem/EasyTimePro/Dashboard';
// import Operatorhistory from './components/pages/BiometricSystem/EasyTimePro/components/Operatorhistory';







function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>

            <Route path="/home" element={<HomePage />} />
            <Route path="/ArVrComponent" element={<ArVrComponent />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/Levelwise" element={<Levelwise />} />
            <Route path="/TrainingOptionsPageNew" element={<TrainingOptionsPageNew />} />
            <Route path="/plan" element={<Plan />} />
            <Route path='/machines' element={<MachinesPage />} />
            <Route path='/machine-allocations' element={<MachineAllocationsPage />} />
            <Route path="/report" element={<Report />} />
            <Route path="/Level0" element={<Level0 />} />
            <Route path="/TempEmployeeSearch" element={<TempEmployeeSearch />} />
            <Route path="/MasterTable" element={<MasterTable />} />
            <Route path="/PassedUsersTable" element={<PassedUsersTable />} />
            <Route path="/ProcessDojo" element={<ProcessDojo />} />
            <Route path="/skillmatrix" element={<SkillMatrixPage />} />
            <Route path="/methodsettings" element={<MethodPage />} />
            <Route path="/allocation" element={<Allocation />} />
            <Route path="/Scheduling" element={<Scheduling />} />
            <Route path="/multinotification" element={<MultiNotification />} />
            <Route path="/refreshment" element={<RefreshmentTraining />} />
            <Route path="/retraining" element={<Retraining />} />
            <Route path="/EmployeeHistorySearch" element={<EmployeeHistorySearch />} />
            <Route path="/ProcessDojo" element={<ProcessDojo />} />
            <Route path="/Level2" element={<Level2 />} />
            <Route path="/Level3" element={<Level3 />} />
            <Route path="/Level4" element={<Level4 />} />
            <Route path="/TrainingOptionsPage" element={<TrainingOptionsPage />} />
            <Route path="/planlist" element={<ProductionPlanList />} />
            <Route path="/question-paper-setting" element={<QuestionPaperSetting />} />
            <Route path="/questions-upload" element={<QuestionUpload />} />
            <Route path="/advanced" element={<Advanced />} />
            <Route path="/advance" element={<Advance />} />
            <Route path="/Hanchou" element={<Hanchou />} />
            <Route path="/Shokuchou" element={<Shokuchou />} />
            <Route path="/Management" element={<Management />} />
            <Route path="/methodsettings" element={<MethodPage />} />
            <Route path="/analytics" element={<Anlitics />} />
            <Route path="/ProductionDataTable" element={<ProductionDataTable />} />

            <Route path="/ExamModeSelector" element={<ExamModeSelector />} />
            <Route path="/remote" element={<RemoteQuiz />} />
            <Route path="/add-question" element={<QuestionForm />} />
            <Route path="/assign-remote" element={<AssignEmployees />} />
            <Route path="/quiz-results" element={<QuizResults />} />
            <Route path="/quiz-instructions" element={<InstructionsPage />} />
            <Route path="/test-ended" element={<TestEnded />} />
            <Route path="/IndividualQuiz" element={<IndividualQuiz />} />
            <Route path="/assign-employees" element={<AssignEmployees />} />
            <Route path="/OJTForm" element={<OJTForm />} />
            <Route path="/OjtSearch" element={<OjtSearch />} />
            <Route path="/approvallist" element={<Approvallist />} />
            <Route path="/Level1" element={<Level1 />} />
            <Route path="/level1/:id" element={<Level1Detailed />} />
            <Route path="/TenCycleMethod" element={<TenCycleMethodPage />} />
            <Route path="/TenCyclePage" element={<TenCyclePage />} />
            <Route path="/Level1Settings" element={<Level1Settings />} />
            <Route path="/Roles" element={<Roles />} />
            <Route path="/notification" element={<AppNotification />} />

            <Route path="/dojoTraining/" element={<DojoDetail />} />
            <Route path="/machineallocationslist" element={<MachineAllocationList />} />
            <Route path="/ContentPage" element={<SimpleContentPage />} />
            <Route path="/PROCESSDOJONEW" element={<PROCESSDOJONEW />} />

            <Route path="/HandoverSheet" element={<HandOverSheet />} />
            <Route path="/ojt-status" element={<OJTStatusList />} />

            <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/VersionControl" element={<PrivacyPolicyVersionControl />} />
            <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
            <Route path='/Level1/attendance' element={<AttendancePage />} />
            <Route path='/Level1/feedbackform' element={<TrainingFeedbackForm />} />


            <Route path='/Observance' element={<Dashboard />} />

            
            <Route path="/answersheet/:scoreId" element={<AnswerSheetView />} />
            <Route path="/results-matrix" element={<ResultsMatrixView />} />
            <Route path="/tencycle-status" element={<TenCycleStatusList/>} />

            {/* Numax easytimepro */}
            <Route path="/easytime-biometric" element={<EasyTimeDashboard />} />
            {/* <Route path="/operator-history" element={<Operatorhistory />} /> */}

            
            
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
