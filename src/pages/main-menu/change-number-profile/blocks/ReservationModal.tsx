import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DefaultTooltip } from "@/components";
import { AccNbrDetailsProps } from "../hooks/ChangeNumberProfileContext";
import { useForm } from "react-hook-form";
import {
  ReservationForm,
  ReservationSchema,
} from "../schema/ChangeNumberProfileSchemaType";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedNumbers: AccNbrDetailsProps[];
  onSuccess: () => void;
}

const API_URL_REF = apiConfigRef.ref;

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  selectedNumbers,
  onSuccess,
}) => {
  const { PostData } = useCallApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ReservationForm>({
    resolver: zodResolver(ReservationSchema),
  });

  //  console.log(errors);

  useEffect(() => {
    if (!selectedNumbers) return;

    reset({
      accNbrDto: selectedNumbers.map((item) => ({
        accNbrId: item.accNbrId,
        accNbr: item.accNbr,
      })),
      reserveExpDate: "",
      reserveType: "S",
      partyType: "F",
      reserveCommets: "",
      reservePartyType: "A",
      reservePartyCode: 1,
      spId: 0,
    });
  }, [reset, selectedNumbers]);

  const joinedAccNbr = selectedNumbers.map((item) => item.accNbr).join(", ");

  const onSubmit = async (data: ReservationForm) => {
    if (!selectedNumbers && !selectedCount) return;

    try {
      //  console.log("payload", data);
      setIsSubmitting(true);
      const response = await PostData(
        `${API_URL_REF}/change-number-profile/reserveAccNbrByCondReal`,
        data,
      );

      if (response?.status) {
        toast.success("Success");
        onSuccess();
        onClose();
      } else {
        toast.error("Failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="container-fixed max-w-[700px] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Reservation</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col">
              <div className="card-body grid gap-5">
                {/* Quantity */}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-3">
                    Quantity
                  </label>
                  <Input
                    className={`input col-span-5`}
                    type="number"
                    autoComplete="off"
                    value={selectedCount}
                    readOnly
                    disabled
                    placeholder="Quantity"
                  />
                </div>

                {/* Service Number */}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-3">
                    Service Number
                  </label>
                  <div className="col-span-5 truncate">
                    <DefaultTooltip title={joinedAccNbr}>
                      <span className="text-sm">{joinedAccNbr}</span>
                    </DefaultTooltip>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-3">
                    <span className="text-red-500">*</span> Expiry Date
                  </label>
                  <input
                    className={`input col-span-5`}
                    type="date"
                    autoComplete="off"
                    {...register("reserveExpDate")}
                  />
                  {errors.reserveExpDate && (
                    <span className="text-red-500">
                      {errors.reserveExpDate.message}
                    </span>
                  )}
                </div>

                {/* Remarks */}
                <div className="grid grid-cols-8 gap-2 items-start">
                  <label className="form-label flex items-center gap-1 col-span-3 pt-2">
                    Remarks
                  </label>
                  <Textarea
                    className={`input col-span-5 ${errors.reserveCommets ? "border-red-500" : ""}`}
                    autoComplete="off"
                    placeholder="Remarks"
                    rows={3}
                    {...register("reserveCommets")}
                  />
                  {errors.reserveCommets && (
                    <span className="text-red-500">
                      {errors.reserveCommets.message}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="default"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    ) : null}
                    {isSubmitting ? "Processing..." : "OK"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onClose()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;
