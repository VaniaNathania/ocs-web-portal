import { UserGrantHistoryDataProvider } from "./hook/UserGrantHistoryDataProvider";
import { HistoryDataMain } from "./main";

const UserGrantHistoryDataContent = () => {
  return (
    <UserGrantHistoryDataProvider>
      <HistoryDataMain />
    </UserGrantHistoryDataProvider>
  );
};

export default UserGrantHistoryDataContent;
