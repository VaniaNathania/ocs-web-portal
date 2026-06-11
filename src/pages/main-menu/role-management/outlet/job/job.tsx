import { JobListProvider } from "./hook/JobProvider";
import RoleJobMain from "./main";

interface Props {
  selectedRow: any;
}

const RoleJob = () => {
  return (
    <JobListProvider>
      <RoleJobMain />
    </JobListProvider>
  );
};

export default RoleJob;
