import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { DefaultTooltip, KeenIcon } from "@/components";
import { DataGridProvider, DataGridColumnHeader } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import SubscriptionPlanSection from "../SubscriptionPlanSection";
import { useOfferGroupHook } from "../../hooks/useOfferGroupHooks";
import AddPrivateOfferGroupSubsPlan, {
  OfferGroupMem,
} from "../../blocks/AddPrivateOfferGroupSubsPlan";
import { OfferGroupDataNew } from "./OfferGroupContentSubsPlanDrop";
import { Button } from "@/components/ui/button";
import SubscriptionPlanSectionPublicOfferGroup from "../PublicOfferGroupSubsPlanContentChild";
import { TestComp } from "../testcomp";
import DealOfferGroupSubsPlan from "../../blocks/DealOfferGroupSubsPlan";
import {
  ButtonCursor,
  PopUpDialog,
} from "@/pages/main-menu/role-management/generalUseComp";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { Input } from "@/components/ui/input";
import { set } from "date-fns";
import { JoinSubsPlan } from "../JoinSubsPlan";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface PublicOfferGroupProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: any;
  group?: any;
}

interface AllFeatureData {
  attrName: string;
  attrCode: string;
  inputType: string;
  attrId: string;
  attrType: string;
  objAttrId: string | null;
  csrVisible: string;
  instantiatable: string;
  configVisible: string;
  editable: string | null;
}

interface FeatureDetailData {
  baseAttrId: string;
  inputType: string;
  nullable: string;
  comments: string;
  defaultValue: string | null;
  valueScript: string | null;
  textAttrId: string;
  dataType: string;
  mask: string | null;
  ruleScript: string | null;
  editable: string;
  exceptionMessage: string;
  minValue: string | null;
  maxValue: string | null;
}

interface OfferGroupItem {
  id: string;
  name: string;
  code: string;
  count: number;
  offers: {
    id: string;
    name: string;
    code: string;
    type: string;
  }[];
}

interface offer extends OfferGroupMem {
  offerName?: string;
  offerCode?: string;
  comments?: string;
  isExpand?: boolean;
}

export interface OfferGroupData extends OfferGroupDataNew, offer {
  child?: offer[];
}

// Define mode types
type ModalMode = "detail" | "edit" | "add";

const API_URL_OFFER = apiConfigOffer.offer;

const PublicOfferGroup: React.FC<PublicOfferGroupProps> = ({
  isOpen,
  onClose,
  rowData,
  group,
}) => {
  const {menuPrivAccess} = useOfferLayout()
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMode, setCurrentMode] = useState<ModalMode>("detail");
  const hooks = useOfferGroupHook();

  const [detailData, setDetailData] = useState<FeatureDetailData | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<AllFeatureData | null>(
    null,
  );
  const { GetData, DeleteData, PutData } = useCallApi();
  const [searchValue, setSearchValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [filterBy, setFilterBy] = useState<"0" | "3" | "4" | "5" | "6">("3");
  const [partys, setPartys] = useState<OfferGroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<OfferGroupData>();
  const [selectedMem, setSelectedMem] = useState<offer>();
  const [isGroupSelected, setIsGroupSelected] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filterOption = [
    { value: "0", label: "Select Offer Type" },
    { value: "3", label: "Related Product" },
    { value: "4", label: "Price Plan" },
    { value: "5", label: "Goods Product" },
    { value: "6", label: "Default Price Plan" },
  ];

  const selectLabel =
    filterOption.find((opt) => opt.value === filterBy)?.label ?? "";

  // Initial form data - combining both API structures
  const initialFormData: offer = {
    offerGroupName: "",
    offerName: "",
    isExpand: false,
  };

  const [formData, setFormData] = useState<offer>(initialFormData);

  // Mode handlers
  const handleEditMode = () => {
    // setCurrentMode("edit");
    setIsDealDialogOpen(true);
  };

  const handleAddMode = () => {
    setIsAddDialogOpen(true);
  };

  const initialize = async () => {
    setIsLoading(true);
    try {
      let data: OfferGroupData[] = [];
      data = await hooks.fetchQryOfferGroupAndMember(filterBy, "2");

      setPartys(data);
      //  console.log(data);
      handleSelect(data[0]);
      // always reset after each run
      // setSelectedOffers([]);
    } catch (error) {
      //  console.log(error);
    } finally {
      // console.log(partys);
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setSearchTerm("");
    setCurrentMode("detail");
    setSelectedFeature(null);
    setDetailData(null);
    setFormData(initialFormData);
    onClose();
  }, [onClose]);

  // Get mode title
  const getModeTitle = () => {
    switch (currentMode) {
      case "add":
        return "Feature Name";
      case "edit":
        return `${selectedFeature?.attrName || "Feature Name"}`;
      default:
        return selectedFeature?.attrName || "Details";
    }
  };

  const [toPass, setToPass] = useState<OfferGroupData>();

  // useEffect(() => {
  //   // console.log(selectedGroup?.offerGroupId, toPass?.offerGroupId);
  //   if (toPass?.offerGroupId != selectedGroup?.offerGroupId)
  //     setToPass(selectedGroup);
  // }, [selectedGroup]);

  const groupType = (str: string) => {
    switch (str) {
      case "A":
        return "All Select";
      case "B":
        return "Single Select";
      case "C":
        return "Multi Select";

      default:
        return "-";
    }
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState<boolean>(false);
  const [nodeToDel, setNodeToDel] = useState<any>();
  const [showConfirmDel, setShowConfirmDel] = useState<boolean>(false);
  const handleDelete = async () => {
    setShowConfirmDel(true);
  };

  const onDelSubsPlanSelect = async () => {
    try {
      const submitData = {
        offerGroupId: nodeToDel?.offerGroupId,
      };

      const response = await DeleteData(
        `${API_URL_OFFER}/offer/group/del-offer-group/${submitData.offerGroupId}`,
        // submitData
        {},
      );

      if (response?.status) {
        toast.success(response.message);
      } else toast.error(response?.message);

      // console.log(submitData, nodeToDel);
    } catch (error) {
      //  console.log(error);
    } finally {
      setShowConfirmDel(false);
      initialize();
    }
  };
  const [formEdit, setFormEdit] = useState<offer>();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setFormEdit(selectedMem);
    setIsEditing(false);
  };

  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);

  const handleEditConfirm = async () => {
    setShowEditDialog(true);
  };

  const onEditConfirm = async () => {
    //  console.log(formEdit);

    try {
      const response = await PutData(
        `${API_URL_OFFER}/offer/group/mod-offer-group-mem`,
        formEdit,
      );

      if (response?.status) {
        toast.success(response.message);
      } else toast.error(response?.message);
    } catch (error) {
      toast.error("Failed to update data");
      //  console.log(error);
    } finally {
      setShowEditDialog(false);
      setIsEditing(false);
    }
  };

  // Sync with selectedMem whenever it changes
  useEffect(() => {
    setFormEdit(selectedMem);
  }, [selectedMem]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const scrollToItem = (id: string) => {
    const el = rowRefs.current[id];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleSelect = async (row: OfferGroupData) => {
    setSearchValue("");
    setShowSuggestions(false);
    if (!row) {
      setSelectedGroup(undefined);

      return;
    }
    const index = partys.findIndex((p) => p.offerGroupId === row.offerGroupId);
    // setSelectedGroup(row);
    // handleExpand(row);
    // console.log(row);
    if ((row.child?.length ?? 0) > 0 || !row.offerGroupId) {
      setSelectedGroup(row);
      setPartys((prev) =>
        prev.map((p, i) => (i === index ? { ...p, isExpand: !p.isExpand } : p)),
      );
      return;
    }

    const resp = await hooks.fetchGroupSubsPlanVerChild(row.offerGroupId);

    setPartys((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, child: resp, isExpand: !p.isExpand } : p,
      ),
    );
    setSelectedGroup({ ...row, child: resp });
    setTimeout(() => scrollToItem(String(row.offerGroupId)), 50);
  };

  const suggestions = useMemo(() => {
    if (!searchValue) return [];
    return partys.filter((p) =>
      p.offerGroupName?.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue, partys]);

  const [showJoinSubsPlan, setShowJoinSubsPlan] = useState<boolean>(false);

  useEffect(() => {
    if (isDealDialogOpen) return;
    if (isAddDialogOpen) return;
    if (isOpen) initialize();
  }, [isOpen, filterBy, isAddDialogOpen, isDealDialogOpen]);

  useEffect(() => {
    if (!showJoinSubsPlan) setRefresh((prev) => prev + 1);
  }, [showJoinSubsPlan]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AddPrivateOfferGroupSubsPlan
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        group={selectedGroup}
        isPublic={true}
        type={filterBy === "0" ? "1" : `${parseInt(filterBy) - 2}`}
      />

      <DealOfferGroupSubsPlan
        isOpen={isDealDialogOpen}
        onClose={() => setIsDealDialogOpen(false)}
        group={selectedGroup}
      />

      <PopUpDialog
        desc="Are you sure to Delete selected group?"
        isOpen={showConfirmDel}
        handleDialog={setShowConfirmDel}
        onConfirm={onDelSubsPlanSelect}
        bgOn={false}
        // type="alert"
      />

      <PopUpDialog
        desc="Are you sure to Update selected member?"
        isOpen={showEditDialog}
        handleDialog={setShowEditDialog}
        onConfirm={onEditConfirm}
        bgOn={false}
        // type="alert"
      />

      <JoinSubsPlan
        isOpen={showJoinSubsPlan}
        handleOpen={setShowJoinSubsPlan}
        payload={{
          offerGroupType: selectedGroup?.offerGroupType ?? "0",
          offerGroupId: selectedGroup?.offerGroupId ?? 0,
          indepProdSpecId: selectedGroup?.indepProdSpecId ?? 0,
          networkType: selectedGroup?.networkType ?? "",
          spId: 0,
        }}
      />

      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="bg-gray-100 px-4 py-3 border-b flex-row justify-between items-center space-y-0">
          <DialogTitle className="flex items-center text-lg font-semibold text-gray-800">
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 pr-2"
            >
              <KeenIcon icon="left" />
            </button>
            {/* ini di subsplan */}
            Public Offer Group
          </DialogTitle>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          ></button>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0 p-4">
          {/* Left Panel - Offer Group List */}
          <div className="w-1/3 bg-white border border-gray-200 rounded shadow-sm flex flex-col min-h-0">
            {/* Header */}
            <div className="p-3 border-b">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-800">Offer Group</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={initialize}
                    size="sm"
                    variant="outline"
                    // className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                    title="Refresh"
                  >
                    <KeenIcon icon="arrows-circle" />
                  </Button>
                  <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                  <Button
                    onClick={handleAddMode}
                    size="sm"
                    // className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                    title="New"
                  >
                    <KeenIcon icon="plus" />
                  </Button>
                  </AccessWrapper>
                </div>
              </div>

              <div className="relative flex flex-row space-x-2">
                <div className="flex-1">
                  <Select
                    value={filterBy}
                    onValueChange={(val: "0" | "3" | "4" | "5" | "6") =>
                      setFilterBy(val)
                    }
                  >
                    <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
                      <SelectValue placeholder={`Search ${selectLabel}..`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Select Offer Type</SelectItem>
                      <SelectItem value="3">Related Product</SelectItem>
                      <SelectItem value="4">Price Plan</SelectItem>
                      <SelectItem value="5">Goods Product</SelectItem>
                      <SelectItem value="6">Default Price Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filterBy != "0" && (
                  <Button
                    className="w-1/12"
                    size={"sm"}
                    variant={"ghost"}
                    onClick={() => setFilterBy("0")}
                  >
                    <KeenIcon icon="cross" />
                  </Button>
                )}

                {/* <label className="input input-sm flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="w-full"
                    placeholder={`Search ${selectLabel}..`}
                  />
                  <KeenIcon icon="magnifier" />
                </label> */}
              </div>

              <div className="flex items-center gap-3 w-full py-3">
                <label className="input input-sm w-full flex items-center relative">
                  <div className="flex flex-row gap-2">
                    <KeenIcon icon="magnifier" />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(event) => {
                        setSearchValue(event.target.value);
                        setShowSuggestions(true);
                      }}
                      className="w-full"
                      placeholder={`Search ${selectLabel}..`}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 150)
                      } // delay so click still works
                      onFocus={() => searchValue && setShowSuggestions(true)}
                    />
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-50 max-h-40 overflow-auto">
                      {suggestions.map((p, idx) => (
                        <li
                          key={idx}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onMouseDown={() => handleSelect(p)} // use onMouseDown so blur doesn’t hide it first
                        >
                          <DefaultTooltip
                            title={`${p.offerGroupName}`}
                            placement="top"
                          >
                            <div>{p.offerGroupName}</div>
                          </DefaultTooltip>
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>
            </div>

            {/* Groups and Offers List */}
            <div className="relative flex-1 overflow-auto px-1">
              {isLoading && <Loading />}
              <ul className="mt-2 text-sm px-2">
                {partys?.map((item, index) => {
                  const isOpen = item.isExpand;
                  const isSelected =
                    selectedGroup?.offerGroupId === item?.offerGroupId;

                  const handleFetchChildOffer = async () => {
                    if ((item.child?.length ?? 0) > 0 || !item.offerGroupId) {
                      handleSelectGroup();
                      setPartys((prev) =>
                        prev.map((p, i) =>
                          i === index ? { ...p, isExpand: !p.isExpand } : p,
                        ),
                      );
                      return;
                    }

                    const resp = await hooks.fetchGroupSubsPlanVerChild(
                      item.offerGroupId,
                    );

                    setPartys((prev) =>
                      prev.map((p, i) =>
                        i === index
                          ? { ...p, child: resp, isExpand: !p.isExpand }
                          : p,
                      ),
                    );
                    setSelectedGroup({ ...item, child: resp });
                  };

                  const handleSelectGroup = () => {
                    if (item.offerGroupId !== selectedGroup?.offerGroupId) {
                      setSelectedGroup(item);
                    }
                    setIsGroupSelected(true);
                  };

                  return (
                    <li
                      key={index}
                      ref={(el) => {
                        if (el && item.offerGroupId != null) {
                          rowRefs.current[String(item.offerGroupId)] = el;
                        }
                      }}
                    >
                      <div className="flex flex-row space-x-2 item">
                        <div
                          className={`flex items-center flex-1 px-2 py-1 w-[90%] hover:bg-gray-200 rounded transition-colors duration-200`}
                        >
                          <button onClick={handleFetchChildOffer}>
                            <KeenIcon
                              icon="right"
                              className={`mr-2 ${isOpen ? "rotate-90" : ""}`}
                            />
                          </button>
                          <button
                            className="flex-1 min-w-0 text-left"
                            onClick={() => {
                              if (item.child) handleSelectGroup();
                              else handleFetchChildOffer();
                            }}
                          >
                            <span
                              className={`block font-medium text-xs whitespace-normal break-words ${
                                isSelected && isGroupSelected
                                  ? "text-blue-700 font-semibold"
                                  : ""
                              }`}
                            >
                              {item.offerGroupName}
                            </span>
                          </button>
                        </div>
                        <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
                        <Button
                          className="flex items-center gap-1 ml-auto w-1/10"
                          size={"sm"}
                          variant={"ghost"}
                          onClick={() => {
                            setNodeToDel(item);
                            handleDelete();
                          }}
                        >
                          <KeenIcon icon="trash" />
                        </Button>
                        </AccessWrapper>
                      </div>

                      {/* Render offer sub-items */}
                      {isOpen && item.child && (
                        <ul className="ml-4 font-light text-xs mt-1">
                          {item?.child.length > 0 ? (
                            item.child.map((child) => {
                              const isSelected =
                                selectedMem?.offerGroupMemId ===
                                child.offerGroupMemId;

                              const handleSelectOffer = () => {
                                setSelectedMem(child);
                                setIsGroupSelected(false);
                              };

                              return (
                                <li key={child.offerGroupMemId}>
                                  <button
                                    onClick={handleSelectOffer}
                                    className={`flex items-center w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:shadow-sm ${
                                      isSelected && !isGroupSelected
                                        ? "bg-blue-100 border-2 border-blue-400 shadow-sm"
                                        : "hover:bg-gray-100"
                                    }`}
                                    title={`${child.offerName} (${child.offerCode})`}
                                  >
                                    <KeenIcon
                                      icon="element-11"
                                      className={`w-4 h-4 mr-2 transition-colors duration-200 ${
                                        isSelected && !isGroupSelected
                                          ? "text-blue-600"
                                          : "text-gray-500 hover:text-blue-500"
                                      }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <span
                                        className={`block truncate transition-colors duration-200 ${
                                          isSelected && !isGroupSelected
                                            ? "font-semibold text-blue-800"
                                            : "hover:text-gray-900"
                                        }`}
                                      >
                                        {child.offerName}
                                      </span>
                                      <span className="block text-gray-400 text-xs truncate">
                                        {child.offerCode}
                                      </span>
                                    </div>
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-2 py-1.5 text-gray-500 italic">
                              {searchValue
                                ? "No matching offers found"
                                : "No offers available"}
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right Panel - Feature Details */}
          <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-auto">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {getModeTitle()}
              </h3>
            </div>

            {/* Form Content */}
            {isGroupSelected ? (
              <div className="p-6">
                <div className="space-y-4">
                  {/* Row 1 - Feature Type & Feature Code */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                      <span className="text-sm text-gray-800">Group Mode:</span>

                      <span className="text-sm font-medium text-gray-800">
                        {groupType(selectedGroup?.groupType ?? "")}
                      </span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                      <span className="text-sm text-gray-800">Group Code:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {selectedGroup?.offerGroupCode || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Row 2 - Feature Name & Feature Category*/}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                      <span className="text-sm text-gray-800">
                        {" "}
                        Lower Limit:
                      </span>

                      <span className="text-sm font-medium text-gray-800">
                        {selectedGroup?.lowerLimit || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                      <span className="text-sm text-gray-800">
                        Upper Limit:
                      </span>

                      <span className="text-sm font-medium text-gray-800">
                        {selectedGroup?.upperLimit || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Row 3 - Contact Channel & CSR Visible*/}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                      <span className="text-sm text-gray-800">
                        Effective Date:
                      </span>

                      <span className="text-sm font-medium text-gray-800">
                        {selectedGroup?.effDate}
                      </span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                      <span className="text-sm text-gray-800">
                        Expiry Date:
                      </span>

                      <div>{selectedGroup?.expDate || "-"}</div>
                    </div>
                  </div>

                  {/* Row 4 - Project Visible & Instantiation */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                      <span className="text-sm text-gray-800">Remarks:</span>

                      <div>{selectedGroup?.comments || "-"}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-8 pt-4">
                  {/* <>
                  <button
                    type="button"
                    onClick={handleEditMode}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedGroup}
                  >
                    Edit
                  </button>
                </> */}
                <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                  <ButtonCursor
                    onClick={handleEditMode}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disable={!selectedGroup}
                  >
                    Edit
                  </ButtonCursor>
                        </AccessWrapper>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 p-6">
                {/* Left column */}
                <div className="flex flex-row space-x-2">
                  {/* Agreement Period */}
                  <div className="flex items-center space-x-2 w-1/2">
                    <div className="w-1/2 truncate text-sm font-medium">
                      Agreement Period
                    </div>
                    <div className="flex w-1/2 space-x-2">
                      <Input
                        type="number"
                        value={formEdit?.agreementPeriod ?? ""}
                        onChange={(e) =>
                          setFormEdit((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  agreementPeriod: Number(e.target.value),
                                }
                              : prev,
                          )
                        }
                        placeholder="-"
                        autoComplete="off"
                        className="w-full"
                        disabled={!isEditing}
                        min={0}
                      />
                      <Select
                        value={formEdit?.timeUnit ?? ""}
                        onValueChange={(val: "D" | "W" | "M" | "Y" | "") =>
                          setFormEdit((prev) => ({
                            ...prev,
                            timeUnit: val != "" ? val : undefined,
                          }))
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent side="top">
                          <SelectItem value="D">Day</SelectItem>
                          <SelectItem value="W">Week</SelectItem>
                          <SelectItem value="M">Month</SelectItem>
                          <SelectItem value="Y">Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Default Choice */}
                  <div className="flex items-center space-x-2 w-1/2">
                    <div className="w-1/2 truncate text-sm font-medium">
                      Default Choice
                    </div>
                    <div className="w-1/2">
                      <input
                        type="checkbox"
                        checked={formEdit?.defaultFlag === "Y"}
                        onChange={() =>
                          setFormEdit((prev) => ({
                            ...prev,
                            defaultFlag: prev?.defaultFlag === "Y" ? "N" : "Y",
                          }))
                        }
                        disabled={!isEditing}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-row space-x-2">
                  {/* Agreement Effective Type */}
                  <div className="flex items-center space-x-2 w-1/2">
                    <div className="w-1/2 truncate text-sm font-medium">
                      Agreement Effective Type
                    </div>
                    <div className="w-1/2">
                      <Select
                        value={formEdit?.agreementEffType ?? ""}
                        onValueChange={(val: "1" | "2" | "3" | "4" | "") =>
                          setFormEdit((prev) => ({
                            ...prev,
                            agreementEffType: val != "" ? val : undefined,
                          }))
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent side="top">
                          <SelectItem value="1">Next Day</SelectItem>
                          <SelectItem value="2">Next Month</SelectItem>
                          <SelectItem value="3">Next Billing Cycle</SelectItem>
                          <SelectItem value="4">Today 0:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Hide Flag */}
                  <div className="flex items-center space-x-2 w-1/2">
                    <div className="w-1/2 truncate text-sm font-medium">
                      Hide Flag
                    </div>
                    <div className="w-1/2">
                      <input
                        type="checkbox"
                        checked={formEdit?.hideFlag === "Y"}
                        onChange={() =>
                          setFormEdit((prev) => ({
                            ...prev,
                            hideFlag: prev?.hideFlag === "Y" ? "N" : "Y",
                          }))
                        }
                        disabled={!isEditing}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="w-full flex justify-end">
                  {!isEditing ? (
                    <ButtonCursor
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disable={!formEdit}
                    >
                      Edit
                    </ButtonCursor>
                  ) : (
                    <div className="flex space-x-2">
                      <ButtonCursor
                        onClick={handleEditCancel}
                        variant="outline"
                        className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        disable={!formEdit}
                      >
                        Cancel
                      </ButtonCursor>
                      <ButtonCursor
                        onClick={handleEditConfirm}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disable={!formEdit}
                      >
                        Save
                      </ButtonCursor>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="px-6 pt-3 border-t">
              <div className="flex py-2 items-center">
                <h3 className="pr-5 font-medium text-lg ">
                  {selectedGroup?.offerGroupName}
                </h3>
                <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                <Button
                  size={"sm"}
                  className="border rounded-md p-2 text-sm bg-blue-500 hover:bg-blue-700 text-white"
                  onClick={() => setShowJoinSubsPlan(true)}
                  disabled={!selectedGroup}
                >
                  Join Subsciption Plan
                </Button>
                        </AccessWrapper>
              </div>
              {/* <TestComp rowData={selectedGroup} /> */}
              <SubscriptionPlanSectionPublicOfferGroup
                // rowData={selectedGroup}
                refresh={refresh}
                offerGroupId={selectedGroup?.offerGroupId}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublicOfferGroup;
