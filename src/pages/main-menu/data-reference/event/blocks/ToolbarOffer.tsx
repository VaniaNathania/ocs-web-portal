import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useEventListContext } from "../hooks/useEventContext";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";

export interface OfferDataList {
  prodSpecId: number;
  prodSpecName: string;
  stdCode: string;
  offerType: string;
  offerTypeName: string;
  offerId: number;
  offerName: string;
}

interface ToolbarOfferProps {
  datas: (data: OfferDataList[]) => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const ToolbarOffer: React.FC<ToolbarOfferProps> = ({ datas }) => {
  const { offerType } = useEventListContext();
  const { GetData } = useCallApi();
  const [selectedOfferType, setSelectedOfferType] = useState<string | null>(
    null,
  );
  const [nameValue, setNameValue] = useState<string | null>(null);
  const [codeValue, setCodeValue] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<boolean>(false);

  const allowed = ["1", "2", "3"];

  //   useEffect(() => {
  //   //  console.log(nameValue);
  //   //  console.log(codeValue);
  //   //  console.log(selectedOfferType);
  //   }, [codeValue, nameValue, selectedOfferType]);

  const handleQuery = async () => {
    if (!selectedOfferType) {
      setErrorType(true);
      return;
    }

    const queryData = {
      prodSpecName: nameValue,
      stdCode: codeValue,
      offerType: selectedOfferType,
    };

    await fetchOffer4reConf(queryData);
  };

  const handleReset = () => {
    setNameValue(null);
    setCodeValue(null);
    setSelectedOfferType(null);
  };

  const fetchOffer4reConf = async (queryData: any) => {
    if (!queryData) return;

    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-offer-4re-conf`,
        {
          ...queryData,
          state: "A",
          spId: 0,
        },
      );

      if (response?.status) {
        datas(response.data);
      } else {
        toast.error(response.message || "Failed Fetch Data");
      }
    } catch (error) {
      //  console.log(error);
    }
  };

  return (
    <div className="border rounded-lg shadow-sm bg-white m-3">
      <div className="p-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {/* Prefix */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap w-24">
              Offer Name
            </label>
            <Input
              type="text"
              className="h-9 flex-1"
              placeholder="Search Offer Name..."
              value={nameValue || ""}
              onChange={(event) => setNameValue(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap w-24">
              Offer Code
            </label>
            <Input
              type="text"
              className="h-9 flex-1"
              placeholder="Search Feature Name..."
              value={codeValue || ""}
              onChange={(event) => setCodeValue(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap w-24">
              <span className="text-red-500">*</span>Offer Type
            </label>
            <div className="flex-1">
              <Select
                onValueChange={(val) => {
                  setSelectedOfferType(val);
                  setErrorType(false);
                }}
                value={selectedOfferType || ""}
              >
                <SelectTrigger
                  className={`h-9 ${errorType && "border border-red-500 hover:border-red-500 focus:border-red-500"}`}
                >
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {offerType.length > 0 &&
                    offerType
                      .filter((item) => allowed.includes(item.offerType))
                      .map((item) => (
                        <SelectItem key={item.offerType} value={item.offerType}>
                          {item.offerTypeName}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              {errorType && (
                <p className="text-red-500 text-sm">Offer Type is required</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              className="h-9 px-6 bg-blue-600 hover:bg-blue-700"
              onClick={handleQuery}
            >
              Query
            </Button>
            <Button
              variant="outline"
              className="h-9 px-6"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolbarOffer;
