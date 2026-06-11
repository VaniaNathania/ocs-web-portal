import { useEffect, useState } from "react";
import { AuditLogTable } from "./block/AuditLogTable";
import { AuditLogQuery } from "./block/AuditLogQuery";

export interface PageDto {
  search: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "desc" | "asc";
}

export const UserMain = () => {
  useEffect(() => {
    document.title = "Audit Log";
  }, []);
  return (
    <div>
      <div className="space-y-5 mb-5">
        <AuditLogQuery />
        <AuditLogTable />
      </div>
    </div>
  );
};
