import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import FeatureSearchBar from "./FeatureSearchBar";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { Loading } from "@/components/common/Loading";

const dummyOperationList = [
  {
    id: 1,
    featureName: "PAYMENT TIMES",
    featureCode: "EXP_PAYMENT_TIMES",
    defaultValue: "SAMANTHA",
  },
  {
    id: 2,
    featureName: "2G Service Brand",
    featureCode: "EXP_2GUSER_BRAND",
    defaultValue: "OLE ROMENY",
  },
  {
    id: 3,
    featureName: "ACCOUNT STATE",
    featureCode: "EXP_ACCT_STATE",
    defaultValue: "Saltoo dong mas bagus",
  },
];

interface Props {
  onSelect: (feature: any) => void;
}

const API_URL = apiConfig.service_price_plan;

const FeatureListPanel = ({ onSelect }: Props) => {
  const { GetData } = useCallApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [optionFeatureList, setOptionFeatureList] = useState<
    IOptionFeatureList[]
  >([]);
  const [isFetching, setIsFetching] = useState(false);

  const filteredList = optionFeatureList.filter((f) =>
    f.attrName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOptionFeatureList = async (searchParams: string) => {
    setIsFetching(true);
    try {
      const response = await GetData(
        `${API_URL}/account-feature/list/attrName`,
        {
          page: 1,
          size: 500,
          sortBy: "attrId",
          sortDirection: "asc",
          attrName: searchParams,
        }
      );

      if (response.status) {
        setOptionFeatureList(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(
        "Error Fetching Option Features. Please Check Your Connection!"
      );
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    getOptionFeatureList(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col flex-1 border border-gray-300 rounded-lg bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-300">
        <FeatureSearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {isFetching && <Loading />}
        {filteredList.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No data found</div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.attrId}
              onClick={() => onSelect(item)}
              className="flex items-center justify-between px-4 py-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-red-50"
            >
              <span className="text-gray-700">{item.attrName}</span>
              <span className="text-xs text-gray-400">{item.attrCode}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeatureListPanel;
