import { Box, Typography } from "@mui/material";
import { ReservationHistoryDatas } from "../components/ServiceNumberHistoryModal";
import { CircleDot } from "lucide-react";

interface TimelineReserveProps {
  steps: ReservationHistoryDatas[];
}

const TimelineReserve = ({ steps }: TimelineReserveProps) => {
  return (
    <Box className="w-full flex flex-col gap-2 items-end">
      {steps.map((step, index) => (
        <Box key={index} className="flex gap-3 relative">
          {/* CANCEL DATE */}
          {step.state === "X" && <Typography className="flex relative">{step.createdDate}</Typography>}

          {/* LEFT SIDE (icon + line) */}
          <Box className="flex flex-col items-center">
            {/* Dot / Icon */}
            <Box className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white">
              <CircleDot />
            </Box>

            {/* Line (kecuali item terakhir) */}
            {index !== steps.length - 1 || index === 0 ? <Box className="w-[2px] flex-1 bg-gray-300 mt-1" /> : ""}
          </Box>

          {/* RIGHT SIDE (content) */}
          <Box className="pb-4 w-[200px]">
            <Typography fontSize="14px" fontWeight="bold" color="primary" className="pb-2">
              {step.state === "X" ? "De-Reservation" : "Reservation"}
            </Typography>

            <Typography fontSize="12px">
              <span className="font-semibold">State:</span> {step.state === "X" ? "Cancel" : "Reserved"}
            </Typography>

            <Typography fontSize="12px">
              <span className="font-semibold">Reservation Type:</span> {step.reserveType === "S" ? "Staff Reserve" : ""}
            </Typography>

            <Typography fontSize="12px">
              <span className="font-semibold">Reserved Date:</span> {step.reserveDate}
            </Typography>

            <Typography fontSize="12px">
              <span className="font-semibold">Reserved Expiry Date:</span> {step.reserveExpDate}
            </Typography>

            <Typography fontSize="12px">
              <span className="font-semibold">Reserved By:</span> {step.reservePartyCodeDesc}
            </Typography>

            {step.state === "X" && (
              <Typography fontSize="12px">
                <span className="font-semibold">De-Reserved By:</span> {step.reservePartyCodeDesc}
              </Typography>
            )}

            <Typography fontSize="12px">
              <span className="font-semibold">Reserver Remarks:</span> {step.reserveCommets || ""}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default TimelineReserve;
