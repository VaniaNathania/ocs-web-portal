import { useEffect, useState } from "react";
import { SystemLogTable } from "./block/SystemLogTable";
import { SystemLogQuery } from "./block/SystemLogQuery";

export interface PageDto {
  search: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "desc" | "asc";
}

export const UserMain = () => {
  useEffect(() => {
    document.title = "System Log";
  }, []);
  return (
    <div>
      <div className="space-y-5 mb-5">
        <SystemLogQuery />
        <SystemLogTable />
      </div>
    </div>
  );
};
