import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import AvailableOffer from "./available";
import OwnedOffer from "./owned";
import { useOfferApply } from "../hooks/context";
import { OfferApply } from "../../../interface";
import { useLifeCycle } from "../../../hooks/context";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const API_URL = apiConfigRef.ref;

const AddOfferDialogMain = () => {
  const {
    ownedOffer,
    availableOffer,
    setIsEditing,
    setOwned,
    setAvailable,
    setAvailableOffer,
    setOwnedOffer,
    owned,
    available,
    setDialogOpen,
    isLoading,
  } = useOfferApply();
  const { setShowConfirm, setDesc, setOnConfirm, selectedLifeCycle } =
    useLifeCycle();
  const { PostData } = useCallApi();

  const handleUpdate = (offers: OfferApply[]) => {
    setOwned((prev) => [...prev, ...offers]);
    setAvailable((prev) =>
      prev.filter(
        (ava) => !offers.map((item) => item.offerId).includes(ava.offerId),
      ),
    );
    setAvailableOffer([]);
  };

  const handleDelete = (offers: OfferApply[]) => {
    setAvailable((prev) => [...prev, ...offers]);
    setOwned((prev) =>
      prev.filter(
        (own) => !offers.map((item) => item.offerId).includes(own.offerId),
      ),
    );

    setOwnedOffer([]);
  };

  const AvaToOwn = async () => {
    setIsEditing(true);
    try {
      await handleUpdate(availableOffer);
    } catch (error) {
      //   toast.error("Failed to edit");
    } finally {
      setIsEditing(false);
      //   handleEditDialog(false);
    }
  };

  const OwnToAva = async () => {
    setIsEditing(true);
    try {
      await handleDelete(ownedOffer);
    } catch (error) {
      //   toast.error("Failed to edit");
    } finally {
      setIsEditing(false);
      //   handleEditDialog(false);
    }
  };

  const handleSave = () => {
    setShowConfirm(true);
    setDesc(`apply selected over into lifecycle?`);
    setOnConfirm(() => () => onSave());
  };

  const onSave = async () => {
    // console.log("owned", owned);
    // console.log("available", available);
    try {
      const payload = {
        lifecycleType: selectedLifeCycle?.lifeCycleType.toString(),
        spId: 0,
        lifecycleApplyList: owned.map((own) => ({
          offerId: own.offerId.toString(),
        })),
      };
      //  console.log(payload);

      const resp = await PostData(
        `${API_URL}/api/lifecycle-type/AddLifecycleApplyBatch`,
        payload,
      );

      if (resp?.status) {
        toast.success(resp.message);
        return setDialogOpen(false);
      }
      toast.error(resp?.message);
    } catch (error) {
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {isLoading && <Loading />}
      <div className="h-full flex flex-col md:flex-row flex-1 min-h-0 gap-5 pt-5">
        {/* Left column */}
        <div className="h-[47%] md:w-[45%] flex flex-col min-h-0 md:h-full">
          <AvailableOffer />
        </div>

        {/* Buttons mobile */}
        <div className="h-[6%] flex flex-row justify-center items-center md:hidden space-x-4">
          <Button onClick={AvaToOwn} className="w-[20px] h-[20px] p-3">
            <KeenIcon icon="down" />
          </Button>
          <Button onClick={OwnToAva} className="w-[20px] h-[20px] p-3">
            <KeenIcon icon="up" />
          </Button>
        </div>

        {/* Buttons desktop */}
        <div className="hidden md:flex md:w-[10%] flex-col justify-center px-2 gap-2 items-center">
          <Button onClick={AvaToOwn} className="w-[20px] h-[20px] p-3">
            <KeenIcon icon="right" />
          </Button>
          <Button onClick={OwnToAva} className="w-[20px] h-[20px] p-3">
            <KeenIcon icon="left" />
          </Button>
        </div>

        {/* Right column */}
        <div className="h-[47%] md:w-[45%] flex flex-col min-h-0 md:h-full">
          <OwnedOffer />
        </div>
      </div>
      <div className="flex flex-row gap-2 justify-end">
        <Button size={"sm"} onClick={handleSave}>
          Save
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => setDialogOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddOfferDialogMain;
