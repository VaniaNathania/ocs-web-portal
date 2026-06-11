import StaffTable from "../components/orgStaff";
import OrgTable from "../components/orgTable";

const Main = () => {
  return (
    <div className="grid grid-cols-2 gap-2 items-start">
      <OrgTable />
      <StaffTable />
    </div>
  );
};

export default Main;
