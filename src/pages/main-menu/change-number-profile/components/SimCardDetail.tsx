import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";

interface SimCardDetailProps {
  isOpen: boolean;
  onClose: () => void;
  iccid: string;
}

export interface SimCardDetailsProps {
  accNbr: string;
  simCardId: number;
  simTypeId: number;
  iccid: string;
  hlrId: number;
  imsi: string;
  pin1: string;
  puk1: string;
  pin2: string;
  puk2: string;
  ki: string;
  staffId: number;
  orgId: number;
  simState: string;
  areaId: number;
  stateDate: string;
  comments: string;
  imsi2: string;
  ki2: string;
  esn: string;
  injectFlag: string;
  adm: string;
  recycleFlag: string;
  checkSum: string;
  createdDate: string;
  k4: string;
  isBindingFlag: string;
  spId: number;
  simTypeName: string;
  simStateName: string;
  orgName: string;
  areaName: string;
  hlrName: string;
}

const API_URL_REF = apiConfigRef.ref;

const SimCardDetail: React.FC<SimCardDetailProps> = ({
  isOpen,
  onClose,
  iccid,
}) => {
  const { GetData } = useCallApi();
  const [simCardData, setSimCardData] = useState<SimCardDetailsProps | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && iccid.length > 0) {
      fetchSimCardDetails(iccid);
    }
  }, [isOpen, iccid]);

  const fetchSimCardDetails = async (iccid: string) => {
    setLoading(true);

    try {
      const response = await GetData(
        `${API_URL_REF}/change-number-profile/qry-sim-card-details`,
        {
          search: "",
          page: 1,
          size: 10,
          sortBy: "simCardId",
          sortDirection: "asc",
          iccidBegin: iccid,
          iccidEnd: iccid,
        },
      );

      if (response?.status) {
        setSimCardData(response?.data[0]);
      } else {
        toast.error("Failed Get Data");
      }
    } catch {
      console.error("Failed Get Data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //  console.log(simCardData);
  }, [simCardData]);

  if (!simCardData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-base font-semibold">
            SIM Card Detail
            {loading && (
              <span className="ml-2 text-xs text-gray-500 font-normal">
                Loading...
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4 overflow-auto">
          <div className="grid grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  ICCID
                </label>
                <input
                  type="text"
                  value={simCardData.iccid}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">ESN</label>
                <input
                  type="text"
                  value={simCardData.esn}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  SIM Card Type
                </label>
                <input
                  type="text"
                  value={simCardData.simTypeName}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={simCardData.orgName}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">PIN1</label>
                <input
                  type="text"
                  value={simCardData.pin1}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">PIN2</label>
                <input
                  type="text"
                  value={simCardData.pin2}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Bound
                </label>
                <input
                  type="text"
                  value={simCardData.isBindingFlag}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">IMSI</label>
                <input
                  type="text"
                  value={simCardData.imsi}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  IMSI2
                </label>
                <input
                  type="text"
                  value={simCardData.imsi2}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  SIM Card State
                </label>
                <input
                  type="text"
                  value={simCardData.simStateName}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Telecom Region
                </label>
                <input
                  type="text"
                  value={simCardData.areaName}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">PUK1</label>
                <input
                  type="text"
                  value={simCardData.puk1}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">PUK2</label>
                <input
                  type="text"
                  value={simCardData.puk2}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Service Number
                </label>
                <input
                  type="text"
                  value={simCardData.accNbr}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Inject Flag
                </label>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
                    <input
                      type="radio"
                      name="injectFlag"
                      value="Y"
                      checked={simCardData.injectFlag === "Y"}
                      disabled
                      className="w-4 h-4 cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-500">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
                    <input
                      type="radio"
                      name="injectFlag"
                      value="N"
                      checked={simCardData.injectFlag === "N"}
                      disabled
                      className="w-4 h-4 cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-500">No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">ADM</label>
                <input
                  type="text"
                  value={simCardData.adm}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Check Sum
                </label>
                <input
                  type="text"
                  value={simCardData.checkSum}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Primary NE
                </label>
                <input
                  type="text"
                  value={simCardData.hlrName}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">KI</label>
                <input
                  type="text"
                  value={simCardData.ki}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">KI2</label>
                <input
                  type="text"
                  value={simCardData.ki2}
                  disabled
                  className="w-full px-3 py-1.5 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-4">
            <label className="text-sm text-gray-600 block mb-1">Remarks</label>
            <textarea
              value={simCardData.comments}
              disabled
              className="w-full px-3 py-2 text-sm border rounded bg-gray-100 text-gray-500 cursor-not-allowed resize-none"
              rows={3}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimCardDetail;
