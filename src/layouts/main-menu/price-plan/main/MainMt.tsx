import { Toolbar, ToolbarHeading } from "../toolbar";
import { PricePlanTabs } from "../blocks/PricePlanTabs";

const MainMt = () => {
  return (
    <div className="grow" role="content">
      {/* Tab-based content instead of Outlet */}
      <PricePlanTabs />
      {/* <AddDialog /> */}
    </div>
  );
};

export { MainMt };
