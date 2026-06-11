import { Button } from "@/components/ui/button";
import { useSubscriberListContext } from "../hooks";
import { KeenIcon } from "@/components";
import { useEffect, useState } from "react";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { MoveLeft } from "lucide-react";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useQuery } from "@tanstack/react-query";

const API_URL = apiConfigOrder.order;

const SubsListFormHeader = () => {
  const { selectedOperation, setSelectedOperation, selectedSubs } =
    useSubscriberListContext();
  const { selectedUser } = useOrder();
  const { GetData } = useCallApi();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const onConfirmCancel = async () => {
    // console.log("muncul");

    setShowConfirm(false);
    setSelectedOperation(undefined);
  };

  const fetchReservation = async () => {
    try {
      const payload = {
        subsId: selectedSubs?.subsId,
        subsEventId: selectedOperation?.subsEventId,
      };
      const resp = await GetData(
        `${API_URL}/api/order-entry/timer-event/qry-reservation-order`,
        payload,
      );

      if (resp.status) {
        setShowAlert(true);
      }
      return !resp.status;
    } catch (error) {
      return false;
    }
  };

  const subsResrv = useQuery({
    queryKey: ["Subs-Resrv", selectedSubs, selectedOperation],
    queryFn: () => fetchReservation(),
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div className="border-b px-6 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoveLeft className="w-5 h-5 text-gray-600" size={16} />
          </button>
          <span className="text-gray-600">
            {selectedOperation?.displayName ?? selectedOperation?.eventName}
          </span>
          <span className="text-gray-400">/</span>
          <span className="font-medium">{selectedSubs?.subsPlanName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-sm">
            {selectedUser?.custName?.charAt(0)}
          </div>
          <span className="text-sm text-gray-700">
            {selectedUser?.custName}
          </span>
        </div>
      </div>
      <PopUpDialog
        isOpen={showConfirm}
        handleDialog={setShowConfirm}
        onConfirm={onConfirmCancel}
        desc="Are you sure to cancel your order?"
        bgOn={false}
      />
      <PopUpDialog
        isOpen={showAlert}
        title="Information"
        handleDialog={setShowAlert}
        type="alert"
        desc="A reservation order already exists on the number."
        bgOn={false}
      />
    </>
  );
};

export default SubsListFormHeader;
