import { CompListProvider } from "./hook/CompProvider";
import RoleCompMain from "./main";

const DirMenuMain = () => {
  return (
    <CompListProvider>
      <RoleCompMain />
    </CompListProvider>
  );
};

export default DirMenuMain;
