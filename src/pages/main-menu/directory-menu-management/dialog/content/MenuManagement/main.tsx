import { Button } from "@/components/ui/button";
import { DirMenuManagementList } from "./block/DirMenuManagementList";
import { MenuDetail } from "./block/MenuDetail";

export const DirMenuManagementMain = () => {
  return (
    <div className="px-5 h-full flex flex-col gap-10">
      <div className="h-1/2">
        <DirMenuManagementList />
      </div>
      <div className="h-1/2">
        <MenuDetail />
      </div>
    </div>
  );
};
