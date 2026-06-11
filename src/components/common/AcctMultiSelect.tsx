import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight, Search, X } from "lucide-react";
import { useState } from "react";

interface AcctItemOption {
  id: number;
  acctItemTypeName: string;
}

interface AcctItemWithStatus extends AcctItemOption {
  status?: "A" | "D";
}

interface MultiSelectProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  options?: AcctItemOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  maxHeight?: string;
  value: AcctItemWithStatus[];
  onAdd?: (item: AcctItemOption) => void;
  onRemove?: (itemId: number) => void;
  onClear?: () => void;
  onUndoDelete?: (itemId: number) => void;
}

const AcctMultiSelect = ({
  showDialog,
  setShowDialog,
  options,
  placeholder,
  searchPlaceholder,
  maxHeight,
  value,
  onAdd,
  onRemove,
  onClear,
  onUndoDelete,
}: MultiSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions =
    options?.filter(
      (option) =>
        option.acctItemTypeName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !value.some((selected) => selected.id === option.id)
    ) || [];

  const groupedOptions = filteredOptions.reduce(
    (groups, option) => {
      const firstLetter = option.acctItemTypeName.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(option);
      return groups;
    },
    {} as Record<string, AcctItemOption[]>
  );

  const handleSelectItem = (option: AcctItemOption) => {
    onAdd?.(option);
  };

  const handleRemoveItem = (optionId: number) => {
    onRemove?.(optionId);
  };

  const handleClearAll = () => {
    onClear?.();
  };

  return (
    <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
      <DialogContent className="max-w-[1000px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="w-full p-6 mx-auto bg-white w-">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              {placeholder}
            </h2>

            <div className="flex gap-6 h-96">
              {/* Left Panel - Available Options */}
              <div className="flex flex-col flex-1 border border-gray-300 rounded-lg bg-gray-50">
                <div className="p-4 bg-white border-b border-gray-300">
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* scrollable area */}
                <div className="flex-1 overflow-y-auto">
                  {Object.keys(groupedOptions).length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? "Data is empty" : "All item is selected"}
                    </div>
                  ) : (
                    Object.entries(groupedOptions).map(
                      ([category, categoryOptions]) => (
                        <div key={category} className="mb-2">
                          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                            <span className="text-sm font-medium tracking-wide text-gray-600 uppercase">
                              {category}
                            </span>
                          </div>
                          {categoryOptions.map((option) => (
                            <div
                              key={option.id}
                              onClick={() => handleSelectItem(option)}
                              className="flex items-center justify-between px-4 py-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-red-50 group"
                            >
                              <span className="text-gray-700">
                                {option.acctItemTypeName}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 transition-colors group-hover:text-red-500" />
                            </div>
                          ))}
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              {/* Right Panel - Selected Items */}
              <div className="flex-1 overflow-hidden border border-gray-300 rounded-lg bg-gray-50">
                <div className="p-4 bg-white border-b border-gray-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Selected Item ({value.length})
                    </h3>
                    {value.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="px-3 py-1 text-sm text-red-600 transition-colors rounded hover:text-red-800 hover:bg-red-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className="overflow-y-auto max-h-[325px]"
                  style={{ maxHeight: maxHeight }}
                >
                  {value.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No item selected
                    </div>
                  ) : (
                    <div className="p-2">
                      {value.map((item) => {
                        const isDeleted = item.status === "D";
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 mb-2 border rounded-lg shadow-sm transition-all ${
                              isDeleted
                                ? "bg-red-50 border-red-300 opacity-70"
                                : "bg-white border-gray-200 hover:shadow-md"
                            }`}
                          >
                            <div className="flex flex-col">
                              <span
                                className={`font-medium ${
                                  isDeleted
                                    ? "text-red-600 line-through"
                                    : "text-gray-700"
                                }`}
                              >
                                {item.acctItemTypeName}
                              </span>
                              {isDeleted && (
                                <span className="text-xs text-red-500">
                                  Marked for deletion
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {isDeleted ? (
                                // 🔄 Undo delete
                                <button
                                  onClick={() => onUndoDelete?.(item.id)}
                                  className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200"
                                >
                                  Undo
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 text-gray-400 transition-colors rounded hover:text-red-500 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AcctMultiSelect;
