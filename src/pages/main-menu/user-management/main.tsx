import { useEffect, useState } from "react";
import { NavBtn } from "./block/navButton";
import { UserDetail } from "./block/userDetail";
import { UserManagementTable } from "./block/userManagementTable";
import { UserQuery } from "./block/userQuery";
import { UserGrantRole } from "./dialog/grantRole";
import { UserGrantPortal } from "./dialog/grantPortal";
import { UserGrantMenu } from "./dialog/grantMenu";
import { UserGrantPortlet } from "./dialog/grantPortlet";
import { UserGrantComp } from "./dialog/grantComp";
import { UserHistory } from "./dialog/userHistory";
import { UserExport } from "./dialog/export";
import { UserIPLimit } from "./dialog/ipLimit";
import { UserGrantDataPrivelage } from "./dialog/grantDataPrivelage";
import { UserEditPass } from "./dialog/editPass";
import { UserReason } from "./dialog/reason";

export interface PageDto {
  search: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "desc" | "asc";
}

export const UserMain = () => {
  return (
    <div>
      <UserEditPass />
      <UserReason />
      <UserGrantRole />
      <UserGrantPortal />
      <UserGrantMenu />
      {/* <UserGrantPortlet />
      <UserGrantComp /> */}
      <UserHistory />
      {/* <UserExport />
      <UserIPLimit />
      <UserGrantDataPrivelage /> */}
      <div className="space-y-5 mb-5">
        <NavBtn />
        <UserQuery />
        <UserManagementTable />
        <UserDetail />
      </div>
    </div>
  );
};
