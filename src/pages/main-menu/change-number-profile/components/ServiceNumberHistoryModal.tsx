import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { useChangeNumberProfileContext } from "../hooks/useChangeNumberProfileContext";
import { Loading } from "../../role-management/block/loadingBlock";
import TimelineReserve from "../blocks/TimelineReserve";

interface ServiceNumberHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceNumber: string;
}

export interface ReservationHistoryDatas {
  accNbrId: number;
  seq: number;
  createdDate: string;
  state: string;
  stateDate: string;
  reserveType: string;
  certTypeId: number;
  certNbr: string | null;
  expDate: string | null;
  pwd: string | null;
  reserveDate: string;
  reserveExpDate: string;
  partyType: string;
  partyCode: string;
  reservePartyType: string;
  reservePartyCode: string;
  reserveCommets: string | null;
  cancelDate: string | null;
  cancelPartyType: string | null;
  cancelPartyCode: string | null;
  spId: number;
  reservePartyCodeDesc: string;
}

const API_URL = apiConfigRef.ref;

const ServiceNumberHistoryModal = ({ isOpen, onClose, serviceNumber }: ServiceNumberHistoryModalProps) => {
  const { GetData } = useCallApi();
  const { selectedItem } = useChangeNumberProfileContext();
  const [reservationHistoryDatas, setReservationHistoryDatas] = useState<ReservationHistoryDatas[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchQryAccNbrReserveByCon = async (accNbrId: number | undefined, spId: number | undefined) => {
    setIsLoading(true);
    try {
      const response = await GetData(`${API_URL}/change-number-profile/qry-acc-nbr-reserve-by-con`, {
        accNbrId,
        spId,
      });

      if (!response?.status) {
        toast.error(response.message || "Failed GetData!");
      }

      setReservationHistoryDatas(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedItem?.accNbrId && !selectedItem?.spId) return;

    if (isOpen) {
      fetchQryAccNbrReserveByCon(selectedItem?.accNbrId, selectedItem?.spId);
    } else {
      setReservationHistoryDatas([]);
    }
  }, [isOpen, selectedItem]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex-1">
            <DialogTitle className="text-base font-semibold mb-1">Service Number History</DialogTitle>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4"></button>
        </div>

        {/* Content */}
        {/* <div className="grid grid-cols-2"> */}
        <div className="px-5 py-4 min-h-[200px] overflow-y-auto">
          {isLoading && <Loading />}
          <div className="flex flex-col gap-3">
            <div className="">
              <DialogDescription className="text-sm text-gray-600">
                Service Number (<span className="text-blue-600">{serviceNumber}</span>) History
              </DialogDescription>
              <Button variant="default" className="bg-blue-700 text-white rounded-lg hover:bg-blue-800">
                Reserve
              </Button>
            </div>
            <div className="">{reservationHistoryDatas.length > 0 ? <TimelineReserve steps={reservationHistoryDatas} /> : ""}</div>
          </div>
          {/* </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceNumberHistoryModal;
