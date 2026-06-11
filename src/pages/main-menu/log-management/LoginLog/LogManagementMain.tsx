import { LogManagementProvider } from "./hook/LogManagementProvider";
import { UserMain } from "./main";

export default function LogManagementMain() {
  return (
    <LogManagementProvider>
      <UserMain />
    </LogManagementProvider>
  );
}
