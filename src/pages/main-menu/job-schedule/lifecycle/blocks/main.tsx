import { ConfirmDialog } from "@/pages/main-menu/directory-menu-management/block/confirmationDialog";
import CanvasLifecycle from "../components/canvas";
import SideBar from "../components/sidebar";
import { useLifeCycle } from "../hooks/context";
import Menu from "./nav";
import LifeCycleOfferApply from "../components/apply/offerApply";

const Main = () => {
  const { showConfirm, setShowConfirm, onConfirm, desc, selectedMenu } =
    useLifeCycle();
  return (
    <div className="flex row p-5 h-[90vh] gap-2 ">
      <div className="border-2 h-full w-[360px] rounded-md shadow-md">
        <SideBar />
      </div>
      <div className="border-2 flex-1 flex flex-col rounded-md shadow-md">
        <Menu />
        <div className="flex-1">
          {selectedMenu === "Canvas" && <CanvasLifecycle />}
          {selectedMenu === "Apply" && <LifeCycleOfferApply />}
        </div>
        <ConfirmDialog
          isOpen={showConfirm}
          handleDialog={setShowConfirm}
          onConfirm={onConfirm}
          desc={desc}
        />
      </div>
    </div>
  );
};

export default Main;
