import { AuditLogProvider } from "./hook/AuditLogProvider"
import { UserMain } from "./main"

export default function AuditLog() {
  return (
    <AuditLogProvider>
      <UserMain />
    </AuditLogProvider>
  )
}
