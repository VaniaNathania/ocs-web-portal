import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DefaultTooltip, KeenIcon } from "@/components";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { useOfferGroupHook } from "../hooks/useOfferGroupHooks";
import { toast } from "sonner";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Button } from "@/components/ui/button";
import { selectedRowHigligt } from "@/styles/style";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface Offer {
  id: number;
  name: string;
  isNecessary: boolean;
  parentId?: number;
}

export interface AvailableOffer {
  effDate: string;
  groupType: string;
  offerGroupId: number;
  offerGroupName: string;
  offerGroupType: string;
  shareFlag: string;
  necessary?: "1" | "0";
}

export interface AvailableOfferChild {
  defaultFlag: "Y" | "N";
  defaultNum: number;
  duplicateFlag: string;
  hideFlag: "N" | "Y";
  isPackage: "N" | "Y";
  offerEffDate: string;
  offerGroupId: number; //ini parent id
  offerGroupMemId: number; //ini id dia
  offerGroupType: string;
  offerId: number;
  offerName: string;
  seq: number;
  spId: number;
}

interface payload {
  offerGroupType: string;
  subsPlanOfferSelectDto: [
    {
      offerVerId: number;
      offerGroupId: number;
      necessary: string;
      spId: number;
      seq: number;
    },
  ];
}

interface parentChildNode {
  index: string;
  parentIndex: string;
  isChild: boolean;
  level: number;
}

interface node extends AvailableOffer, parentChildNode, AvailableOfferChild {}

interface SelectOfferGroupSubsPlanProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const SelectOfferGroupSubsPlan: React.FC<SelectOfferGroupSubsPlanProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedOffers, setSelectedOffers] = useState<node[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState<string>("3");
  const [offerToDelete, setOfferToDelete] = useState<node>();
  const { selectedSubSubPlan, selectedVer, servType, menuPrivAccess } =
    useOfferLayout();
  const { fetchGroupSubsPlanVer, fetchGroupSubsPlanVerChild } =
    useOfferGroupHook();
  const [availableOffers, setAvailableOffers] = useState<node[]>([]);
  const [showConfirmAdd, setShowConfirmAdd] = useState<boolean>(false);
  const [showConfirmDel, setShowConfirmDel] = useState<boolean>(false);
  // const [delId,setDelId] = useState<node>()

  const { PostData, DeleteData } = useCallApi();

  useEffect(() => {
    const init = async () => {
      const resp: node[] = await fetchGroupSubsPlanVer(
        selectedSubSubPlan.indepProdSpecId,
        servType.networkType,
        filterBy,
        selectedVer?.offerVerId ?? 0,
      );

      const data = resp
        .sort((a, b) => a.seq - b.seq)
        .map(
          (item: node) =>
            (item = {
              ...item,
              index: `${item.offerGroupId * 100000}`,
              parentIndex: "0",
              isChild: false,
              level: 0,
            }),
        );

      setAvailableOffers((prev) => (prev = data));
      setSelectedOffers([]);
    };

    init();
    // console.log(selectedOffers, "ini selected");
    // console.log(availableOffers, "ini ava");
  }, [selectedVer, filterBy, isOpen]);

  const filterOption = [
    { value: "3", label: "Related Product" },
    { value: "4", label: "Price Plan" },
    { value: "5", label: "Goods Product" },
    { value: "6", label: "Default Price Plan" },
  ];

  const selectLabel =
    filterOption.find((opt) => opt.value === filterBy)?.label ?? "";

  const [formData, setFormData] = useState({
    groupName: "",
    groupCode: "",
    groupMode: "Multi-Select",
    quantityLimit: { lower: "", upper: "" },
    effectiveTime: { start: "", end: "" },
    agreementText: "",
    agreementPeriod: "",
    effectiveType: "",
  });

  const [searchValue, setSearchValue] = useState<string>("");

  const [relatedProductSearch, setRelatedProductSearch] = useState("");

  const moveToSelected = (offer: node) => {
    setExpandedGroup((prev) => prev.filter((group) => group !== offer.index));
    if (!offer.isChild) {
      setSelectedOffers((prev) => (prev = [...prev, offer]));
      setAvailableOffers((prev) => {
        prev = prev?.filter((item) => item.index !== offer.index);
        prev = prev?.filter((item) => item.parentIndex !== offer.index);

        return prev;
      });
    }
  };

  const moveToAvailable = (offer: node) => {
    setExpandedGroup((prev) => prev.filter((group) => group !== offer.index));
    if (!offer.isChild) {
      setAvailableOffers((prev) => {
        if (prev) {
          prev = [...prev, offer];
          return prev;
        } else return [offer];
      });
      setSelectedOffers((prev) => {
        prev = prev?.filter((item) => item.index !== offer.index);
        prev = prev?.filter((item) => item.parentIndex !== offer.index);

        return prev;
      });
    }
  };

  const moveAllToSelected = () => {
    setExpandedGroup([]);
    setSelectedOffers((prev) => {
      if (availableOffers) return [...prev, ...availableOffers];
      else return [...prev];
    });
    setAvailableOffers([]);
  };

  const moveAllToAvailable = () => {
    setExpandedGroup([]);

    setAvailableOffers((prev) => {
      if (!prev) return [...selectedOffers];
      else if (selectedOffers) return [...prev, ...selectedOffers];
      else return [...prev];
    });
    setSelectedOffers([]);
  };

  // hapus dari available
  const handleDeleteConfirm = () => {
    if (!offerToDelete) return;

    // if ("type" in offerToDelete) {
    //   // Parent
    //   setAvailableOffers((prev) =>
    //     prev.filter((o) => o.id !== offerToDelete.id)
    //   );
    //   setOfferChildren((prev) =>
    //     prev.filter((c) => c.parentId !== offerToDelete.id)
    //   );
    // } else {
    //   // Child
    //   setOfferChildren((prev) => prev.filter((c) => c.id !== offerToDelete.id));
    // }

    // setOfferToDelete(null);
    //  console.log(offerToDelete);
  };

  const toggleOfferSelection = (
    id: string,
    field: keyof Pick<node, "necessary">,
  ) => {
    setSelectedOffers((prev) =>
      prev.map((offer) =>
        offer.index === id
          ? { ...offer, [field]: offer[field] === "1" ? "0" : "1" }
          : offer,
      ),
    );
  };

  const getChildren = (parentId: number) => {
    // return offerChildren.filter((child) => child.parentId === parentId);
    //  console.log("get child");
  };

  const toggleExpand = (id: string) => {
    setExpandedGroup((prev) =>
      prev.includes(id) ? prev.filter((group) => group !== id) : [...prev, id],
    );
  };

  const handleExpand = async (offer: node) => {
    if (offer.isChild) return [];
    const isExpand = expandedGroup.includes(offer.index);
    setExpandedGroup((prev) =>
      prev.includes(offer.index)
        ? prev.filter((group) => group !== offer.index)
        : [...prev, offer.index],
    );
    if (isExpand) return [];
    try {
      if (
        availableOffers?.find((item) => item.parentIndex === offer.index) ||
        selectedOffers?.find((item) => item.parentIndex === offer.index)
      )
        return [];
      const response = await fetchGroupSubsPlanVerChild(offer.offerGroupId);

      const responseData = response.map(
        (item: node) =>
          (item = {
            ...item,
            index: `${item.offerGroupId * 100000}-${item.offerGroupMemId}`,
            parentIndex: offer.index,
            isChild: true,
            level: 1,
          }),
      );

      //  console.log(responseData);

      return responseData;
    } catch (error) {
      //  console.log(error);

      toast.error("failed to expand offer");
      return [];
    }
  };

  const handleSubmit = async () => {
    setShowConfirmAdd(true);
  };

  const handleDelete = async () => {
    setShowConfirmDel(true);
  };

  const onAddSubsPlanSelect = async () => {
    try {
      const subsPlan = selectedOffers.map(
        (item: any, index) =>
          (item = {
            offerVerId: selectedVer?.offerVerId ?? 0,
            offerGroupId: item.offerGroupId,
            necessary: item.necessary === "1" ? "1" : "0",
            spId: 0,
            seq: index,
          }),
      );

      const submitData = {
        offerGroupType: filterBy,
        subsPlanOfferSelectDto: subsPlan,
      };

      const response = await PostData(
        `${API_URL_OFFER}/offer/subs-plan/add-subs-plan-offer-select`,
        submitData,
      );

      if (response?.status) {
        toast.success(response.message);
      } else toast.error(response?.message);

      //  console.log(submitData);
    } catch (error) {
      //  console.log(error);
    } finally {
      setShowConfirmAdd(false);
      onClose();
    }
  };

  const onDelSubsPlanSelect = async () => {
    try {
      const subsPlan = selectedOffers.map(
        (item: any, index) =>
          (item = {
            offerVerId: selectedVer?.offerVerId ?? 0,
            offerGroupId: item.offerGroupId,
            necessary: item.necessary === "Y" ? "Y" : "N",
            spId: 0,
            seq: index,
          }),
      );

      const submitData = {
        offerGroupId: offerToDelete?.offerGroupId,
      };

      const response = await DeleteData(
        `${API_URL_OFFER}/offer/group/del-offer-group/${submitData.offerGroupId}`,
        // submitData
        {},
      );

      if (response?.status) {
        toast.success(response.message);
        setAvailableOffers((prev) =>
          prev?.filter((item) => item.offerGroupId !== submitData.offerGroupId),
        );
      } else toast.error(response?.message);

      //  console.log(submitData, offerToDelete);
    } catch (error) {
      //  console.log(error);
    } finally {
      setShowConfirmDel(false);
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // reset state
      setSelectedOffers([]);
      setExpandedGroup([]);
      setSearchValue("");
      setRelatedProductSearch("");
    }
  }, [isOpen]);

  const [toMove, setToMove] = useState<number>();

  const moveUp = (index: number) => {
    if (index === 0) return;
    const temp = selectedOffers[index];
    const temp2 = selectedOffers[index - 1];
    const slicebefore = selectedOffers.slice(0, index - 1);
    const sliceafter = selectedOffers.slice(index + 1, selectedOffers.length);
    const newSeq = [...slicebefore, temp, temp2, ...sliceafter];
    setToMove(index - 1);
    setSelectedOffers(newSeq);

    // console.log(newSeq);
  };
  const moveDown = (index: number) => {
    if (index === selectedOffers.length - 1) return;
    const temp = selectedOffers[index];
    const temp2 = selectedOffers[index + 1];
    const slicebefore = selectedOffers.slice(0, index);
    const sliceafter = selectedOffers.slice(index + 2, selectedOffers.length);
    const newSeq = [...slicebefore, temp2, temp, ...sliceafter];
    setToMove(index + 1);
    setSelectedOffers(newSeq);

    // console.log(newSeq);
  };

  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelect = (row: node) => {
    setSearchValue("");
    setShowSuggestions(false);
    moveToSelected(row);
    // handleExpand(row);
    // console.log(row);
  };

  const suggestions = useMemo(() => {
    if (!searchValue) return [];
    return availableOffers.filter(
      (p) =>
        p.offerName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.offerGroupName?.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue, availableOffers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* <div className="w-full h-full bg-red-600 absolute" /> */}
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        aria-describedby=""
      >
        {/* popUpAdd */}
        <PopUpDialog
          desc="Are you sure to add selected group?"
          isOpen={showConfirmAdd}
          handleDialog={setShowConfirmAdd}
          onConfirm={onAddSubsPlanSelect}
          bgOn={false}
        />
        <PopUpDialog
          desc="Are you sure to Delete selected group?"
          isOpen={showConfirmDel}
          handleDialog={setShowConfirmDel}
          onConfirm={onDelSubsPlanSelect}
          bgOn={false}
          // type="alert"
        />
        <DialogHeader className="flex justify-between items-center border-b bg-gray-100 px-4 py-3">
          <DialogTitle>Offer Group Selector</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-auto p-3">
          {/* Bottom Section */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
            {/* Kiri */}
            <div className="flex flex-col">
              <div className="h-8 flex items-center">
                <span className="text-sm font-medium whitespace-nowrap">
                  Available Offer Group
                </span>
              </div>
              {/* Header kiri */}
              <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-2">
                <Select
                  value={filterBy}
                  onValueChange={(val) => setFilterBy(val)}
                >
                  <SelectTrigger className="w-32 px-2 py-1 text-xs h-8">
                    <SelectValue placeholder={`Search ${selectLabel}..`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Related Product</SelectItem>
                    <SelectItem value="4">Price Plan</SelectItem>
                    <SelectItem value="5">Goods Product</SelectItem>
                    <SelectItem value="6">Default Price Plan</SelectItem>
                  </SelectContent>
                </Select>

                {/* <label className="input input-sm flex items-center gap-2">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="w-full"
                    placeholder={`Search ${selectLabel}..`}
                  />
                  <KeenIcon icon="magnifier" />
                </label> */}
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
                            title={`Add ${p.offerName ?? p.offerGroupName}`}
                            placement="top"
                          >
                            <div>{p.offerName ?? p.offerGroupName}</div>
                          </DefaultTooltip>
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>

              {/* List kiri */}
              <div className="border rounded-lg flex-1">
                <div className="max-h-64 overflow-y-auto">
                  {availableOffers
                    ?.filter((offer) => !offer.isChild)
                    .sort((a, b) =>
                      a.offerGroupName.localeCompare(b.offerGroupName),
                    )
                    .map((offer) => {
                      // const children = getChildren(offer.index);
                      const handleChild = async (index: string) => {
                        const child: node[] = await handleExpand(offer);
                        if (
                          availableOffers.find(
                            (item) => item.parentIndex === index,
                          )
                        )
                          return;

                        setAvailableOffers((prev) => {
                          if (prev) prev = [...prev, ...child];
                          else prev = [...child];
                          return prev;
                        });
                      };
                      // let children: node[] = [];
                      const isExpanded = expandedGroup.includes(offer.index);
                      return (
                        <div key={offer.index} className="border-b">
                          {/* Parent Row */}
                          <div className="flex flex-row items-center justify-between p-2 hover:bg-gray-50">
                            <div className="flex flex-row flex-1 items-center gap-2">
                              <button
                                onClick={() => handleChild(offer.index)}
                                className="p-1 rounded hover:bg-gray-200 w-1/12"
                              >
                                <KeenIcon
                                  icon={isExpanded ? "down" : "right"}
                                />
                              </button>
                              <DefaultTooltip title={offer.offerGroupName}>
                                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                  {offer.offerGroupName}
                                  {/* {offer.seq} */}
                                </span>
                              </DefaultTooltip>
                            </div>
                            <div className="flex flex-row w-1/6 justify-end">
                              <button
                                onClick={() => moveToSelected(offer)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <KeenIcon
                                  icon="plus"
                                  className="text-grey-500"
                                />
                              </button>
                              <button
                                onClick={() => {
                                  setOfferToDelete(offer);
                                  handleDelete();
                                }}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <KeenIcon
                                  icon="minus"
                                  className="text-red-500"
                                />
                              </button>

                              {/* <DeleteSelectOfferGroup
                              offer={offerToDelete}
                              onConfirm={handleDeleteConfirm}
                              onCancel={() => setOfferToDelete(null)}
                            /> */}
                            </div>
                          </div>

                          {/* Child Row */}
                          {isExpanded &&
                            availableOffers.filter(
                              (item) => item.parentIndex === offer.index,
                            ).length > 0 && (
                              <div className="ml-6">
                                {availableOffers
                                  .filter(
                                    (item) => item.parentIndex === offer.index,
                                  )
                                  .map((child) => (
                                    <div
                                      key={child.index}
                                      className="flex items-center justify-between p-2 hover:bg-gray-50"
                                    >
                                      <span className="text-sm text-gray-600">
                                        {child.offerName}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Move All arrows */}
            <div className="flex flex-col items-center justify-center space-y-4 pt-10">
              <button
                onClick={() => moveAllToSelected()}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={availableOffers?.length === 0}
              >
                <KeenIcon icon="right" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => moveAllToAvailable()}
                disabled={selectedOffers.length === 0}
              >
                <KeenIcon icon="left" />
              </button>
            </div>

            {/* Kanan */}
            <div className="flex flex-col">
              {/* Header kanan */}
              <div className="text-sm font-medium whitespace-nowrap flex flex-row items-center justify-between w-full">
                Your Selected {selectedOffers.length} Member
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveUp(toMove ?? 0)}
                  >
                    <KeenIcon icon="arrow-up" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveDown(toMove ?? 0)}
                  >
                    <KeenIcon icon="arrow-down" />
                  </Button>
                </div>
              </div>
              {/* <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-2">
                <div className="h-8 flex items-center">
                </div>
              </div> */}

              {/* List kanan */}
              <div className="border rounded-lg overflow-hidden flex-1">
                {/* Header */}
                <div className="grid grid-cols-2 bg-gray-100 text-sm font-medium text-gray-700 border-b">
                  <div className="px-6 py-2">Group Member</div>
                  <div className="px-5 py-2 text-right">Is Necessary</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {selectedOffers
                    ?.filter((offer) => !offer.isChild)
                    // .sort((a, b) =>
                    //   a.offerGroupName.localeCompare(b.offerGroupName)
                    // )
                    .map((offer, index) => {
                      const handleChild = async (index: string) => {
                        const child: node[] = await handleExpand(offer);
                        if (
                          selectedOffers.find(
                            (item) => item.parentIndex === index,
                          )
                        )
                          return;

                        setSelectedOffers((prev) => {
                          if (prev) prev = [...prev, ...child];
                          else prev = [...child];
                          return prev;
                        });
                      };
                      const isExpanded = expandedGroup.includes(offer.index);

                      return (
                        <div key={offer.index} className="border-b">
                          {/* Parent Row */}
                          <div className="flex justify-between items-center p-2 hover:bg-gray-50 font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleChild(offer.index)}
                                className="p-1 rounded hover:bg-gray-200"
                              >
                                <KeenIcon
                                  icon={isExpanded ? "down" : "right"}
                                />
                              </button>
                              <button
                                className={`${toMove === index ? selectedRowHigligt : ""}`}
                                onClick={() => setToMove(index)}
                              >
                                {offer.offerGroupName ?? offer.offerName}
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={offer.necessary === "1"}
                                  onChange={() =>
                                    toggleOfferSelection(
                                      offer.index,
                                      "necessary",
                                    )
                                  }
                                  className="mr-1"
                                />
                                Yes
                              </label>
                              <button
                                onClick={() => moveToAvailable(offer)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <KeenIcon icon="minus" />
                              </button>
                            </div>
                          </div>

                          {/* Child Row */}
                          {isExpanded &&
                            selectedOffers.filter(
                              (item) => item.parentIndex === offer.index,
                            ).length > 0 && (
                              <div className="ml-6">
                                {selectedOffers
                                  .filter(
                                    (item) => item.parentIndex === offer.index,
                                  )
                                  .map((child) => (
                                    <div
                                      key={child.index}
                                      className="flex items-center justify-between p-2 hover:bg-gray-50"
                                    >
                                      <span className="text-sm text-gray-600">
                                        {child.offerName}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="justify-end space-x-3 pr-7">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </AccessWrapper>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectOfferGroupSubsPlan;
