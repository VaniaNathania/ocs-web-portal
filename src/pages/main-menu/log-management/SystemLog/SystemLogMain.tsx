import { SystemLogProvider } from "./hook/SystemLogProvider"
import { UserMain } from "./main"

export default function SystemLog() {
  return (
    <SystemLogProvider>
      <UserMain />
    </SystemLogProvider>
  )
}
