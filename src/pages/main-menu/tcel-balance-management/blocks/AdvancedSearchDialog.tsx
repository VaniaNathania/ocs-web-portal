import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { DataGridProvider } from "@/components";
import { apiConfig } from "@/config/api.config";
import { ColumnAdvancedSearch } from "../hooks/ColumnAccountInfo";

const API_URL = apiConfig.service_price_plan;

interface AdvancedSearchDialogProps {
  onSelectAccount: (acctNbr: string) => void;
  handleIsOpen: (open: boolean) => void;
  isOpen: boolean;
}

const AdvancedSearchDialog = ({
  onSelectAccount,
  handleIsOpen,
  isOpen,
}: AdvancedSearchDialogProps) => {
  const { GetData } = useCallApi();

  const [acctNbr, setAcctNbr] = useState("");
  const [custName, setCustName] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<"acctNbr" | "custName">(
    "acctNbr",
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (acctNbr || custName) {
        setSearchTrigger((prev) => prev + 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [acctNbr, custName]);

  const doGetAccountInfo = async (page: number, size: number) => {
    const activeValue = searchMode === "acctNbr" ? acctNbr : custName;
    if (!activeValue) {
      return { data: [], totalCount: 0 };
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        size: size.toString(),
        sortBy: "acct_Id",
        sortDirection: "asc",
        ...(searchMode === "acctNbr" && acctNbr && { acctNbr }),
        ...(searchMode === "custName" && custName && { custName }),
      });

      const response: any = await GetData(
        `${API_URL}/balance-adjustment/qry-acct-info?${params.toString()}`,
        {},
      );

      setIsSearching(false);
      return {
        data: response.data || [],
        totalCount: response.totalRows || 0, // Gunakan totalRows dari response
      };
    } catch (error) {
      setIsSearching(false);
      toast.error("Error fetching account information");
      return { data: [], totalCount: 0 };
    }
  };

  const handleRowClick = (row: any) => {
    onSelectAccount(row.acctNbr);
    handleIsOpen(false);
    // Reset search fields
    setAcctNbr("");
    setCustName("");
  };

  const handleClearSearch = () => {
    setAcctNbr("");
    setCustName("");
    setSearchTrigger(0);
  };

  const handleSearchModeChange = (mode: "acctNbr" | "custName") => {
    setSearchMode(mode);
    setAcctNbr("");
    setCustName("");
    setSearchTrigger(0);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClearSearch();
        }
        handleIsOpen(open);
      }}
    >
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-7">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg">Advanced Account Search</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Search Mode Radio Buttons */}
          <div className="flex items-center gap-6 p-3 rounded-lg">
            <Label className="text-sm font-medium">Search By:</Label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="acctNbr"
                checked={searchMode === "acctNbr"}
                onChange={() => handleSearchModeChange("acctNbr")}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Account Number</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="custName"
                checked={searchMode === "custName"}
                onChange={() => handleSearchModeChange("custName")}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Customer Name</span>
            </label>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label
                className={searchMode !== "acctNbr" ? "text-gray-400" : ""}
              >
                Account Number
              </Label>
              <Input
                placeholder="Enter Account Number..."
                value={acctNbr}
                onChange={(e) => setAcctNbr(e.target.value)}
                disabled={searchMode !== "acctNbr"}
              />
            </div>
            <div className="space-y-2">
              <Label
                className={searchMode !== "custName" ? "text-gray-400" : ""}
              >
                Customer Name
              </Label>
              <Input
                placeholder="Enter Customer Name..."
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                disabled={searchMode !== "custName"}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClearSearch}
              disabled={!acctNbr && !custName}
            >
              Clear
            </Button>
          </div>

          {/* Results Table */}
          <div className="border rounded-lg">
            <DataGridProvider
              columns={ColumnAdvancedSearch(handleRowClick)}
              key={searchTrigger}
              pagination={{ size: 10 }}
              layout={{ card: false }}
              serverSide={true}
              onFetchData={({ pageIndex, pageSize }) => {
                return doGetAccountInfo(pageIndex, pageSize);
              }}
            />
          </div>

          {isSearching && (
            <div className="text-center text-sm text-gray-500 py-4">
              Searching...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearchDialog;
