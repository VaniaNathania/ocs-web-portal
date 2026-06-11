import { useEffect, useState } from "react";
import { LogManagementTable } from "./block/LogManagementTable";
import { LogManagementQuery } from "./block/LoginLogQuery";

export interface PageDto {
  search: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "desc" | "asc";
}

export const UserMain = () => {
  useEffect(() => {
    document.title = "Login Log";
  }, []);
  return (
    <div>
      <div className="space-y-5 mb-5">
        <LogManagementQuery />
        <LogManagementTable />
      </div>
    </div>
  );
};
