import { DirMenuManagementProvider } from "./hook/DirMenuManagementProvider";
import { DirMenuManagementMain } from "./main";

const DirMenuManagementContent = () => {
  return (
    <DirMenuManagementProvider>
      <DirMenuManagementMain />
    </DirMenuManagementProvider>
  );
};

export default DirMenuManagementContent;
