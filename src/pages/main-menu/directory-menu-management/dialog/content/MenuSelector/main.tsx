import { Button } from "@/components/ui/button";
import { DirMenuSelectorList } from "./block/DirMenuSelectorList";
import { useCompList } from "../../../hook/useComp";
import { useDirMenuSelector } from "./hook/useDirMenuSelector";
import { useCallApi } from "@/hooks";
import { apiConfigRole } from "@/config/api.config";
import { toast } from "sonner";

const API_URL = apiConfigRole.role;
export const DirMenuSelectorMain = () => {
  const {
    selectedRow,
    setOnConfirm,
    setDesc,
    setShowConfirm,
    setShowMenuSelector,
    // fetchUser,
  } = useCompList();
  const { PostData } = useCallApi();

  const { selectedAvailable, setSelectedAvailable } = useDirMenuSelector();

  const handleUpdate = async () => {
    const payload = {
      dirId: selectedRow?.id,
      spId: 0,
      menuList: selectedAvailable.map((item) => {
        return { menuId: item.privId };
      }),
    };
    //  console.log("Update", payload);
    try {
      const resp = await PostData(`${API_URL}/api/dirs/add-dir-menu`, payload);

      if (resp?.status) {
        setShowMenuSelector(false);
        setShowConfirm(false);
        return toast.success(resp.message);
      }
      toast.error(resp?.message);
    } catch (error) {
      throw toast.error("Failed to select the menu(s)");
    } finally {
      setShowConfirm(false);
    }
  };

  const handleReset = async () => {
    //  console.log("Reset");
    setSelectedAvailable([]);

    setShowMenuSelector(false);
    setShowConfirm(false);
  };

  const handleConfirmation = (bool: boolean) => {
    setShowConfirm(true);
    if (bool) {
      setDesc("Are you sure to save Menu Selector?");
      setOnConfirm(() => () => handleUpdate());
    } else {
      setDesc("Are you sure to discard all changes on Menu Selector?");
      setOnConfirm(() => () => handleReset());
    }
  };
  return (
    <div className="px-5 h-full flex flex-col gap-5">
      <div className="h-5/6">
        <DirMenuSelectorList />
      </div>
      <div className="w-full flex flex-1 justify-end space-x-2">
        <Button onClick={() => handleConfirmation(true)}>OK</Button>
        <Button onClick={() => handleConfirmation(false)} variant="ghost">
          Cancel
        </Button>
      </div>
    </div>
  );
};
