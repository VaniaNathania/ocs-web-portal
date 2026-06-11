import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { toAbsoluteUrl } from "@/utils";
import { useMainProductOfferDetailContext } from "../hooks/useMainProductOfferDetailContext";

import moment from "moment";

const ListToolBar = () => {
  const { table, reload } = useDataGrid();
  const {
    date,
    setDate,
    handleEditMainProductOfferDialog,
    handleAddMainProductOfferDialog,
    showAddMainProductOfferDialog,
    showEditMainProductOfferDialog,
  } = useMainProductOfferDetailContext();

  const [filteredDate, setFilteredDate] = useState<DateRange | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string[]>([]);
  const [isBgTypeDropdownOpen, setIsBgTypeDropdownOpen] = useState(false);
  const [selectedBgStatus, setSelectedBgStatus] = useState<string[]>([]);
  const [isBgStatusDropdownOpen, setIsBgStatusDropdownOpen] = useState(false);

  const [codeInput, setCodeInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const handleReload = () => {
    reload();
  };

  const handleBranchChange = (typeId: string) => {
    setSelectedBranch((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id != typeId)
        : [...prev, typeId]
    );
  };

  const handleFilterData = () => {
    const filters = [];

    if (selectedBranch.length > 0) {
      filters.push({
        id: "branch.id",
        value: selectedBranch,
      });
    }

    const filterValues = {
      code: codeInput?.trim() ? `%${codeInput.trim()}%` : null,
      name: nameInput?.trim() ? `%${nameInput.trim()}%` : null,
    };

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== null) {
        // Cek null, bukan string kosong
        filters.push({
          id: key,
          value: value,
        });
      }
    });

    table.setColumnFilters(filters);
  };

  const handleBgTypeDropdownOpen = () => {
    setIsBgTypeDropdownOpen(true);
  };

  const handleBgTypeDropdownClose = () => {
    setIsBgTypeDropdownOpen(false);
  };

  const handleBgStatusDropdownOpen = () => {
    setIsBgStatusDropdownOpen(true);
  };

  const handleBgStatusDropdownClose = () => {
    setIsBgStatusDropdownOpen(false);
  };

  const handleResetData = () => {
    setSelectedBranch([]);
    setSelectedBgStatus([]);
    setDate({
      from: new Date(new Date().setDate(new Date().getDate() - 31)),
      to: new Date(),
    });
    setFilteredDate(null);
    setCodeInput("");
    setNameInput("");
    table.setColumnFilters([]);
    reload();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      handleBgTypeDropdownClose();
      handleBgStatusDropdownClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleBgTypeDropdownClose, handleBgStatusDropdownClose]);

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-between w-full items-center">
          <div className="flex gap-3 items-center">
            <div className="w-auto min-w-[100px]">
              <label className="input input-sm">
                <KeenIcon icon="filter" />
                <input
                  type="text"
                  placeholder="Code"
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value)}
                />
              </label>
            </div>
            <div className="w-auto min-w-[100px]">
              <label className="input input-sm">
                <KeenIcon icon="filter" />
                <input
                  type="text"
                  placeholder="Name"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                />
              </label>
            </div>
            <div className="flex item-center gap-3 ms-2 me-10">
              <DefaultTooltip title={"Filter"} placement={"top"}>
                <Button
                  variant="outline"
                  className="h-7.5"
                  onClick={handleFilterData}
                  type="button"
                >
                  <KeenIcon icon="filter" />
                </Button>
              </DefaultTooltip>
              <DefaultTooltip title={"Reset Filter"} placement={"top"}>
                <Button
                  variant="outline"
                  className="h-7.5"
                  onClick={handleResetData}
                  type="button"
                >
                  <KeenIcon icon="arrow-circle-left" />
                </Button>
              </DefaultTooltip>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Button
              variant="outline"
              className="h-7.5"
              onClick={() => handleAddMainProductOfferDialog(true)}
            >
              Assign
            </Button>
            <DefaultTooltip title={"Refresh"} placement={"top"}>
              <Button
                variant="outline"
                className="h-7.5"
                onClick={handleReload}
              >
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ListToolBar };
