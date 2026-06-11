import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { DataGridProvider, DataGridColumnHeader } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { KeenIcon } from "@/components";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FeatureData } from "../components/DetailCategoryContent/FeatureTabContent";
import { debounce } from "@/lib/helpers";

interface CopyFromFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  oldFeatures: FeatureData[];
  onCopy: (merged: FeatureData[]) => void;
  offerType: string;
}

interface CopyFromFeatureData {
  prodSpecId: number;
  prodSpecName: string;
  stdCode: string;
  offerType: string;
  offerTypeName: string;
  offerId: number;
  offerName: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const CopyFromFeatureDialog: React.FC<CopyFromFeatureDialogProps> = ({
  isOpen,
  onClose,
  oldFeatures,
  onCopy,
  offerType,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<CopyFromFeatureData | null>(
    null,
  );
  const [detailData, setDetailData] = useState<FeatureData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paginatedSize, setPaginatedSize] = useState(5);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsData, setSuggestionsData] = useState<CopyFromFeatureData[]>(
    [],
  );
  const [filterBySelection, setFilterBySelection] = useState(false);
  const [placeHolder, setPlaceHolder] = useState<string>("");
  const [datas, setDatas] = useState<CopyFromFeatureData[]>([]);
  const { GetData } = useCallApi();

  const handleItemClick = async (item: CopyFromFeatureData) => {
    setSelectedItem(item);
    setShowSuggestions(false);
    await detailCopyFrom(item);
  };

  const handleSuggestionClick = async (item: CopyFromFeatureData) => {
    setSearchTerm(item.prodSpecName || item.stdCode);
    setSelectedItem(item);
    setShowSuggestions(false);
    await detailCopyFrom(item);
  };

  const handleOK = () => {
    if (!selectedItem || !detailData) return;
    //  console.log("oldFeatures", oldFeatures);

    const newFeatures = detailData.filter(
      (newF: any) =>
        !oldFeatures.some((oldF: any) => oldF.attrId === newF.attrId),
    );

    //  console.log("newFeatures", newFeatures);

    const merged = [...oldFeatures, ...newFeatures];
    //  console.log("copy from", merged);
    onCopy(merged);
    onClose();
  };

  const handleClose = () => {
    setSelectedItem(null);
    setSearchTerm("");
    setCurrentPage(1);
    if (onClose) onClose();
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const detailCopyFrom = async (copyFrom: CopyFromFeatureData) => {
    try {
      // console.log("📡 Fetching copy from detail data from API...");
      const response = await GetData(
        `${API_URL_OFFER}/offer/attr/qry-offer-attr-by-offer-id`,
        {
          offerIds: [copyFrom.offerId],
        },
      );

      // console.log("✅ Detail API response", response);

      if (response?.data) {
        // console.log("✅ Setting detail data:", response.data);
        setDetailData(response.data as FeatureData[]);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("❌ Detail API Error:", error);
      toast.error("Error GET Feature Detail data");
      return null;
    }
  };

  // DataGrid Columns
  const column = useMemo<ColumnDef<CopyFromFeatureData>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "attrName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Offer Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const name = row.original.offerName;
          const isSelected = selectedItem?.offerId === row.original.offerId;
          return (
            <div
              className={`text-gray-800 cursor-pointer p-2 rounded ${isSelected ? "bg-blue-100 font-semibold" : "hover:bg-gray-50"}`}
              onClick={() => handleItemClick(row.original)}
            >
              {name}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.stdCode,
        id: "attrCode",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Product Code"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const code = row.original.stdCode;
          const isSelected = selectedItem?.offerId === row.original.offerId;
          return (
            <div
              className={`text-gray-800 cursor-pointer p-2 rounded ${isSelected ? "bg-blue-100 font-semibold" : "hover:bg-gray-50"}`}
              onClick={() => handleItemClick(row.original)}
            >
              {code}
            </div>
          );
        },
      },
    ],
    [selectedItem],
  );

  const init = async () => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-offer-4re-conf`,
        {
          prodSpecName: "",
          stdCode: "",
          offerType: offerType ?? "2",
          state: "A",
          spId: 0,
        },
      );

      setDatas(response.data || []);

      await detailCopyFrom(response.data[0]);
    } catch (error) {
      toast.error("Error GetData Copy From");
    }
  };

  useEffect(() => {
    if (isOpen) {
      init();
    } else {
      setDatas([]);
      setPlaceHolder("");
      setSearchTerm("");
    }
  }, [isOpen]);

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      let sortBy = "offerName";
      let sortDirection = "asc";

      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortDirection = sorting[0].desc ? "desc" : "asc";
      }

      if (datas.length === 0) {
        return {
          data: [],
          totalCount: 0,
        };
      }

      try {
        const data = datas;
        const content = data ?? [];
        const total = data?.length;

        let processedData = [...content];

        if (searchTerm.trim() && !filterBySelection) {
          const keyword = searchTerm.toLowerCase();
          processedData = processedData.filter((item) => {
            const prodSpecName = item.prodSpecName?.toLowerCase() ?? "";
            const stdCode = item.stdCode?.toLowerCase() ?? "";
            const offerName = item.offerName?.toLowerCase() ?? "";

            return (
              prodSpecName.includes(keyword) ||
              stdCode.includes(keyword) ||
              offerName.includes(keyword)
            );
          });
        }

        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof CopyFromFeatureData];
            const bValue = b[id as keyof CopyFromFeatureData];

            if (aValue === undefined || bValue === undefined) return 0;

            if (typeof aValue === "string" && bValue === "string") {
              return desc
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue);
            }
            if (typeof aValue === "number" && typeof bValue === "number") {
              return desc ? bValue - aValue : aValue - bValue;
            }

            return 0;
          });
        }

        if (limit !== paginatedSize) {
          setPaginatedSize(limit);
        }

        setSuggestionsData(processedData);

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = processedData.slice(startIndex, endIndex);

        if (!filterBySelection && paginatedData.length > 0) {
          setSelectedItem((prev) => (prev = paginatedData[0]));
        }

        return {
          data: paginatedData,
          totalCount: processedData.length,
        };
      } catch (error) {
        toast.error("Error GetData Copy From");
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [searchTerm, selectedItem, filterBySelection, datas, isOpen],
  );
  const suggestions = useMemo(() => {
    if (!placeHolder) return [];

    const lowerSuggestions = placeHolder.toLowerCase();

    return suggestionsData.filter((item) => {
      const prodSpecName = item.prodSpecName?.toLowerCase() || "";
      const offerName = item.offerName?.toLowerCase() || "";
      const stdCode = item.stdCode?.toLowerCase() || "";

      return (
        prodSpecName.includes(lowerSuggestions) ||
        offerName.includes(lowerSuggestions) ||
        stdCode.includes(lowerSuggestions)
      );
    });
  }, [placeHolder, suggestionsData]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[500px] max-w-5xl h-[600px] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between p-4 border-b bg-gray-100 space-y-0 rounded-t-lg">
          <DialogTitle className="text-sm font-medium text-gray-800">
            Copy From Offer
          </DialogTitle>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            {/* <X size={16} /> */}
          </button>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Offer Name / Product Code"
                value={placeHolder}
                onChange={(e) => {
                  setPlaceHolder(e.target.value);
                  setShowSuggestions(true);
                  if (e.target.value === "") {
                    setSearchTerm("");
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => placeHolder && setShowSuggestions(true)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Dropdown Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadoww-md z-20 max-h-40 overflow-auto">
                  {suggestions.map((itemArray, positionArray) => (
                    <li
                      key={positionArray}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onMouseDown={() => handleSuggestionClick(itemArray)}
                    >
                      {!itemArray.prodSpecName
                        ? itemArray.stdCode
                        : itemArray.offerName}
                    </li>
                  ))}
                </ul>
              )}
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading features...
              </div>
            ) : (
              <DataGridProvider
                key={`copy-from-${searchTerm}-${datas.length}`}
                columns={column}
                pagination={{ size: paginatedSize }}
                layout={{ card: false }}
                sorting={[{ id: "attrName", desc: false }]}
                serverSide={true}
                onFetchData={({
                  pageIndex,
                  pageSize,
                  sorting,
                  columnFilters,
                }) => {
                  return doGetListData(
                    pageIndex + 1,
                    pageSize,
                    sorting,
                    columnFilters,
                  );
                }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-end space-x-2 p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleOK}
            disabled={!selectedItem}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            OK
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyFromFeatureDialog;
