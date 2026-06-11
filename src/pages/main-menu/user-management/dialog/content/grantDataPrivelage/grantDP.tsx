import { UserGrantDPProvider } from "./hook/UserGrantDPProvider";
import UserDPMain from "./main";

interface Props {
  selectedRow: any;
}

export const UserGrantDPContent = () => {
  return (
    <UserGrantDPProvider>
      <UserDPMain />
    </UserGrantDPProvider>
  );
};
