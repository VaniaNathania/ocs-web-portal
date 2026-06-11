import { CompListProvider } from "./hook/CompProvider";
import RoleCompMain from "./main";

const RoleComponent = () => {
  return (
    <CompListProvider>
      <RoleCompMain />
    </CompListProvider>
  );
};

export default RoleComponent;
