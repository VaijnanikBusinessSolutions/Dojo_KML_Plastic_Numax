import MultiSkillNav from '../mutliSkillNavbar/MultiSkillNav';
import Overview from './Overview/overview';
import { SkillFilterProvider } from './Overview/SkillFilterContext';
import MultiSkillingList from './SchedulingList/schedulinglist';



const Scheduling = () => {
  return (
    <div>
      <SkillFilterProvider>
        <MultiSkillNav />
        <Overview />
        {/* <MultiSkillingList /> */}
      </SkillFilterProvider>
    </div>
  );
};

export default Scheduling;

