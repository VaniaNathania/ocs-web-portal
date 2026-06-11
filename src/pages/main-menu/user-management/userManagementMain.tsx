import { UserManagementProvider } from "./hook/UserManagementProvider"
import { UserMain } from "./main"

export default function UserManagementMain() {
  return (
    <UserManagementProvider>
      <UserMain />
    </UserManagementProvider>
  )
}
