import { UserGrantIPLimitProvider } from "./hook/UserGrantIPLimitProvider";
import { IPLimitMain } from "./main";

const UserGrantIPLimitContent = () => {
  return (
    <UserGrantIPLimitProvider>
      <IPLimitMain />
    </UserGrantIPLimitProvider>
  );
};

export default UserGrantIPLimitContent;
