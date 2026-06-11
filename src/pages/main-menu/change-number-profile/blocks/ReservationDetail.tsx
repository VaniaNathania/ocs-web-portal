import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loading } from "../../role-management/block/loadingBlock";
import { useChangeNumberProfileContext } from "../hooks/useChangeNumberProfileContext";

interface ReservationDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReservationDatasProps {
  reserveType: string;
  partyType: string;
  spId: number;
  reserveCommets: string;
  reservePartyType: string;
  createdDate: string;
  partyCode: string;
  reservePartyCode: string;
  stateDate: string;
  state: string;
  accNbrId: number;
  reserveObj: string;
  reserveDate: string;
  reserveExpDate: string;
  seq: number;
}

const API_URL = apiConfigRef.ref;

const ReservationDetail = ({ isOpen, onClose }: ReservationDetailProps) => {
  const { GetData } = useCallApi();
  const { selectedItem } = useChangeNumberProfileContext();
  const [reservationDatas, setReservationDatas] = useState<ReservationDatasProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchReservationDatas = async (accNbrId: number | undefined, spId: number | undefined) => {
    setIsLoading(true);
    try {
      const payload = {
        accNbrId,
        spId,
      };
      const response = await GetData(`${API_URL}/change-number-profile/qry-acc-nbr-card-by-acc-nbr-id`, payload);

      if (!response.status) {
        toast.error(response.message || "Failed GetData!");
      }

      setReservationDatas(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedItem?.accNbrId && !selectedItem?.spId) return;

    if (isOpen) {
      fetchReservationDatas(selectedItem?.accNbrId, selectedItem?.spId);
    } else {
      setReservationDatas([]);
    }
  }, [isOpen, selectedItem]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="container-fixed max-w-[700px] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Reservation Detail</DialogTitle>
          {/* <DialogDescription>Here are the details of your reservation.</DialogDescription> */}
        </DialogHeader>
        <DialogBody>
          {isLoading && <Loading />}
          <div className="flex flex-col space-y-4 m-5">
            <div className="flex flex-row items-center">
              <Label className="w-[200px]">Reservation Method</Label>
              <Input value={reservationDatas?.[0]?.reserveType === "S" ? "Staff Reserve" : ""} disabled />
            </div>
            <div className="flex flex-row items-center">
              <Label className="w-[200px]">Reservation Party Type</Label>
              <Input value={reservationDatas?.[0]?.reservePartyType === "A" ? "Staff" : ""} disabled />
            </div>
            <div className="flex flex-row items-center">
              <Label className="w-[200px]">Reservation Object</Label>
              <Input value={reservationDatas?.[0]?.reserveObj} disabled />
            </div>
            <div className="flex flex-row items-center">
              <Label className="w-[200px]">Created Time</Label>
              <Input value={reservationDatas?.[0]?.createdDate} disabled />
            </div>
            <div className="flex flex-row items-center">
              <Label className="w-[200px]">Expiry Date</Label>
              <Input value={reservationDatas?.[0]?.reserveExpDate} disabled />
            </div>
            <div className="flex flex-row items-center">
              <Label className="w-[200px]">Reserve Remarks</Label>
              <Input value={reservationDatas?.[0]?.reserveCommets} disabled />
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDetail;
