import { CompListProvider } from "./hook/CompProvider";
import RoleCompMain from "./main";

const UserGrantCompContent = () => {
  return (
    <CompListProvider>
      <RoleCompMain />
    </CompListProvider>
  );
};

export default UserGrantCompContent;
