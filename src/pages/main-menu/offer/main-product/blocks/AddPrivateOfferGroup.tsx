import React, { useEffect, useState } from "react";
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
import QuantityLimitField from "./group-mode/QuantityLimitFields";
import EffectiveTimeField from "./group-mode/EffectiveTimeFields";
import AgreementFieldsDropdown from "./group-mode/AgreementFieldsDropdown";
import { Item } from "@radix-ui/react-select";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { useOfferGroupHook } from "../../subscription-plan/hooks/useOfferGroupHooks";

interface Offer {
  id?: number;
  name?: string;
  selected?: boolean;
  hidden?: boolean;
}

export interface DependProdList {
  dependProdSpecId?: number;
  offerName?: string;
  networkType?: string;
  networkTypeName?: string;
  offerExpDate?: string;
  offerEffDate?: string;
  duplicateFlag?: null;
  isPackage?: "N" | "Y";
}

interface QueryOfferByType {
  offerId?: number;
  offerName?: string;
  offerType?: string;
  offerCode?: string;
  networkTypeName?: string;
  networkType?: string;
  duplicateFlag?: null;
  isPackage?: "N" | "Y";
}

export interface OfferGroupMem {
  offerGroupName?: string;
  // offername?: string;
  offerGroupMemId?: number;
  offerGroupId?: number;
  offerId?: number;
  childOfferGroupId?: number;
  agreementPeriod?: number;
  timeUnit?: string;
  seq?: number;
  spId?: number;
  defaultFlag?: string;
  hideFlag?: string;
  agreementEffType?: string;
  upperLimit?: number;
  lowerLimit?: number;
  defaultNum?: number;
}

export interface submit {
  offerGroupId?: number;
  offerGroupType?: string;
  groupType: string;
  networkType?: string;
  offerGroupMemRequestDto: OfferGroupMem[];
  parentOfferGroupId: number;
  offerGroupDto: {
    offerGroupId?: number;
    offerGroupName?: string;
    offerGroupCode?: string;
    offerGroupType?: string;
    groupType: string;
    upperLimit?: number;
    lowerLimit?: number;
    effDate?: string;
    expDate?: string;
    createdDate?: string;
    state?: string;
    stateDate?: string;
    shareFlag?: string;
    indepProdSpecId?: number;
    comments?: string;
    spId: 0;
    offerVerId?: number;
    networkType?: string;
  };
}

export const defaultSubmit: submit = {
  offerGroupType: undefined,
  groupType: "C",
  networkType: undefined,
  offerGroupMemRequestDto: [],
  parentOfferGroupId: 0,
  offerGroupDto: {
    offerGroupName: undefined,
    offerGroupCode: undefined,
    offerGroupType: undefined,
    groupType: "C",
    upperLimit: undefined,
    lowerLimit: undefined,
    effDate: undefined, // default: today
    expDate: undefined,
    createdDate: undefined,
    state: undefined,
    stateDate: undefined,
    shareFlag: "1",
    indepProdSpecId: undefined,
    comments: undefined,
    spId: 0,
    offerVerId: undefined,
    networkType: undefined,
  },
};

export interface AvailableOffer
  extends DependProdList,
    Offer,
    QueryOfferByType,
    OfferGroupMem {}

interface AddPrivateOfferGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  group?: any;
  rowData: any;
  isPublic?: boolean;
  isParent?: boolean;
}
const API_URL_OFFER = apiConfigOffer.offer;
const AddPrivateOfferGroup: React.FC<AddPrivateOfferGroupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  group,
  rowData,
  isPublic = false,
  isParent = false,
}) => {
  const hooks = useOfferGroupHook();
  const [selectedOffers, setSelectedOffers] = useState<AvailableOffer[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const { PostData } = useCallApi();

  const [availableOffers, setAvailableOffers] = useState<AvailableOffer[]>([]);

  const [filterBy, setFilterBy] = useState<string>("1");

  const filterOption = [
    { value: "1", label: "Related Product" },
    { value: "2", label: "Price Plan" },
    { value: "3", label: "Goods Product" },
    { value: "4", label: "Default Price Plan" },
  ];

  const selectLabel =
    filterOption.find((opt) => opt.value === filterBy)?.label ?? "";

  const [formData, setFormData] = useState<submit>(defaultSubmit);

  const [searchValue, setSearchValue] = useState<string>("");

  const [relatedProductSearch, setRelatedProductSearch] = useState("");

  const moveToSelected = (offer: AvailableOffer) => {
    setAvailableOffers((prev) => prev.filter((item) => item.id !== offer.id));
    setSelectedOffers((prev) => [
      ...prev,
      {
        ...offer,
        defaultFlag: "N",
      },
    ]);
  };

  const moveToAvailable = (offer: AvailableOffer) => {
    setSelectedOffers((prev) =>
      prev.filter((item) => item.dependProdSpecId !== offer.dependProdSpecId),
    );
    setAvailableOffers((prev) => [
      ...prev,
      {
        ...offer,
      },
    ]);
  };

  const moveAllToSelected = () => {
    setSelectedOffers((prev) => [...prev, ...availableOffers]);
    setAvailableOffers([]);
  };

  const moveAllToAvailable = () => {
    setAvailableOffers((prev) => [...prev, ...selectedOffers]);
    setSelectedOffers([]);
  };

  const toggleOfferSelection = (
    id: number,
    field: keyof Pick<AvailableOffer, "defaultFlag" | "hideFlag">,
  ) => {
    setSelectedOffers((prev) =>
      prev.map((offer) =>
        offer.id === id
          ? {
              ...offer,
              [field]: offer[field] === "Y" ? "N" : "Y",
            }
          : offer,
      ),
    );
  };

  const onConfirm = async () => {
    try {
      // console.log(rowData);
      if (!formData.offerGroupDto.offerGroupName) {
        return toast.error("Offer Group Name must be filled");
      }
      if (formData.offerGroupDto.offerGroupName.length > 30) {
        return toast.error(
          `Offer Group Name to long (${formData.offerGroupDto.offerGroupName.length} character), maximum of 30 characters`,
        );
      }
      if (
        formData.offerGroupDto.offerGroupCode?.length &&
        formData.offerGroupDto.offerGroupCode.length > 30
      ) {
        return toast.error(
          `Offer Group Code to long (${formData.offerGroupDto.offerGroupCode?.length ?? 0} character), maximum of 30 characters`,
        );
      }
      if (!formData.offerGroupDto.effDate) {
        return toast.error("Offer Group effective date must be filled");
      }
      if (!formData.offerGroupDto.groupType) {
        return toast.error("Offer Group Mode must be selected");
      }
      // if (formData.offerGroupDto.groupType === "B") {
      //   if (formData.offerGroupMemRequestDto.length !== 0) {
      //     if (
      //       !formData.offerGroupMemRequestDto.find(
      //         (item) => item.defaultFlag === "Y"
      //       )
      //     ) {
      //       return toast.error(
      //         "Offer Group Mode Single select must have atleast one default offer"
      //       );
      //     }
      //   }
      // }

      const servType = await hooks.findServiceType(rowData.servType);
      // console.log(servType);

      const submitData: submit = {
        ...formData,
        // offerGroupId: 0,
        networkType: servType?.networkType,
        offerGroupType: (parseInt(filterBy) + 2).toString(),
        offerGroupMemRequestDto: selectedOffers.map(
          (item: AvailableOffer, index) =>
            (item = {
              // ...item,
              // offerGroupMemId: item.offerId ?? item.dependProdSpecId,
              offerId: item.offerId ?? item.dependProdSpecId,
              seq: index,
              spId: 0,
              agreementPeriod: item.agreementPeriod,
              timeUnit: item.timeUnit,
              defaultFlag: item.defaultFlag ?? "N",
              hideFlag: item.hideFlag,
              agreementEffType: item.agreementEffType,
              upperLimit: item.upperLimit,
              lowerLimit: item.lowerLimit,
              defaultNum: item.defaultNum,
            }),
        ),
        offerGroupDto: {
          ...formData.offerGroupDto,
          offerGroupId: undefined,
          offerGroupType: (parseInt(filterBy) + 2).toString(),
          offerVerId: undefined,
          networkType: servType?.networkType,
          indepProdSpecId: rowData.indepProdSpecId,
          groupType: formData.groupType,
          // shareFlag: "1",
          // shareFlag: "N",
        },
        parentOfferGroupId: isParent ? group.offerGroupId : null,
      };

      // console.log(submitData);

      const resp = await PostData(
        `${API_URL_OFFER}/offer/group/add-offer-group`,
        submitData,
      );

      if (resp?.status) {
        toast.success("Offer Group Data Created");
        onClose();
      } else toast.error(resp?.message || "Failed to Add Data");
      // // // console.log(resp,);
    } catch (error) {
      //  console.log(error);

      toast.error("Failed to add data");
    } finally {
      // onClose();
      setShowConfirm(false);
    }
  };

  const handleSubmit = () => {
    setShowConfirm(true);
    // toast.success("test");
  };

  const initialize = async () => {
    try {
      let data: any[] = [];

      switch (filterBy) {
        case "1": {
          // fetch if empty, else reuse
          data = hooks.depend?.length
            ? hooks.depend
            : await hooks.fetchType("1");

          setAvailableOffers(
            data
              .filter((item) => {
                const now = new Date();

                const effDate = item.offerEffDate
                  ? new Date(item.offerEffDate)
                  : null;
                const expDate = item.offerExpDate
                  ? new Date(item.offerExpDate)
                  : null;

                const isEffValid = !effDate || effDate <= now;
                const isExpValid = !expDate || expDate >= now;

                return isEffValid && isExpValid;
              })
              .map((item) => ({
                ...item,
                id: item.dependProdSpecId ?? 0,
                name: item.offerName ?? "",
                selected: false,
                hidden: false,
                agreement: "",
              })),
          );
          // console.log("related", data);
          break;
        }

        case "2": {
          data = hooks.pricePlan?.length
            ? hooks.pricePlan
            : await hooks.fetchType("2");

          setAvailableOffers(
            data
              .filter((item) => {
                const now = new Date();

                const effDate = item.offerEffDate
                  ? new Date(item.offerEffDate)
                  : null;
                const expDate = item.offerExpDate
                  ? new Date(item.offerExpDate)
                  : null;

                const isEffValid = !effDate || effDate <= now;
                const isExpValid = !expDate || expDate >= now;

                return isEffValid && isExpValid;
              })
              .map((item) => ({
                ...item,
                id: item.offerId ?? 0,
                name: item.offerName ?? "",
                selected: false,
                hidden: false,
                agreement: "",
              })),
          );
          // console.log("pricePlan", data);
          break;
        }

        case "3": {
          data = hooks.goodOffer?.length
            ? hooks.goodOffer
            : await hooks.fetchType("3");

          setAvailableOffers(
            data
              .filter((item) => {
                const now = new Date();

                const effDate = item.offerEffDate
                  ? new Date(item.offerEffDate)
                  : null;
                const expDate = item.offerExpDate
                  ? new Date(item.offerExpDate)
                  : null;

                const isEffValid = !effDate || effDate <= now;
                const isExpValid = !expDate || expDate >= now;

                return isEffValid && isExpValid;
              })
              .map((item) => ({
                ...item,
                id: item.offerId ?? 0,
                name: item.offerName ?? "",
                selected: false,
                hidden: false,
                agreement: "",
              })),
          );
          // console.log("goodOffer", data);
          break;
        }

        case "4": {
          data = hooks.defaultPricePlan?.length
            ? hooks.defaultPricePlan
            : await hooks.fetchType("4");

          setAvailableOffers(
            data
              .filter((item) => {
                const now = new Date();

                const effDate = item.offerEffDate
                  ? new Date(item.offerEffDate)
                  : null;
                const expDate = item.offerExpDate
                  ? new Date(item.offerExpDate)
                  : null;

                const isEffValid = !effDate || effDate <= now;
                const isExpValid = !expDate || expDate >= now;

                return isEffValid && isExpValid;
              })
              .map((item) => ({
                ...item,
                id: item.offerId ?? 0,
                name: item.offerName ?? "",
                selected: false,
                hidden: false,
                agreement: "",
              })),
          );
          // console.log("defaultPricePlan", data);
          break;
        }

        default:
          break;
      }

      // always reset after each run
      setSelectedOffers([]);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (isOpen) initialize();
    if (filterBy === "4")
      setFormData((prev) => (prev = { ...prev, groupType: "B" }));
    // console.log(rowData);
  }, [isOpen, filterBy, group, rowData]);

  useEffect(() => {
    setFormData(defaultSubmit);
  }, [isOpen]);

  const ListItemKiri = (offer: AvailableOffer, index: number) => {
    return (
      <DefaultTooltip title={offer.offerName ?? ""} placement="top" key={index}>
        <div
          key={index}
          className="group flex flex-row items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
        >
          <div className="flex-1 items-center space-x-2 text-ellipsis overflow-hidden whitespace-nowrap">
            <span>{offer.offerName ?? ""}</span>
          </div>
          <button
            onClick={() => moveToSelected(offer)}
            className="p-1 hover:bg-gray-200 rounded hidden group-hover:block w-1/12"
          >
            <KeenIcon icon="plus" className="text-green-500" />
          </button>
        </div>
      </DefaultTooltip>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-lg"
        aria-describedby=""
      >
        <PopUpDialog
          isOpen={showConfirm}
          handleDialog={setShowConfirm}
          onConfirm={onConfirm}
          bgOn={false}
        />
        {/* yang ini yang ke pake di private offer group */}
        <DialogHeader className="flex justify-between items-center border-b bg-gray-100 px-4 py-3">
          <DialogTitle>Add Offer Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-auto p-3">
          {/* Offer Group Information */}
          <h2 className="text-lg font-semibold mb-4">
            Offer Group Information
          </h2>
          <div className="border-b pb-6">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="text-red-500">*</span> Group Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.offerGroupDto.offerGroupName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: {
                        ...prev.offerGroupDto,
                        offerGroupName: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group Code
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.offerGroupDto.offerGroupCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: {
                        ...prev.offerGroupDto,
                        offerGroupCode: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group Mode
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="groupType"
                      value="B"
                      checked={formData.groupType === "B"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          groupType: e.target.value,
                        }))
                      }
                      disabled={filterBy === "4"}
                      className="mr-2"
                    />
                    Single Select
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="groupType"
                      value="C"
                      checked={formData.groupType === "C"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          groupType: e.target.value,
                        }))
                      }
                      disabled={filterBy === "4"}
                      className="mr-2"
                    />
                    Multi-Select
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="groupType"
                      value="A"
                      checked={formData.groupType === "A"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          groupType: e.target.value,
                        }))
                      }
                      disabled={filterBy === "4"}
                      className="mr-2"
                    />
                    Select All
                  </label>
                </div>
              </div>

              {/* if group mode !multi-select - render quantity time & effective time*/}
              {formData.groupType === "C" ? (
                <QuantityLimitField
                  lower={formData.offerGroupDto.lowerLimit}
                  upper={formData.offerGroupDto.upperLimit}
                  onChange={(field, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: { ...prev.offerGroupDto, [field]: value },
                    }))
                  }
                />
              ) : (
                <EffectiveTimeField
                  start={formData.offerGroupDto?.effDate}
                  end={formData.offerGroupDto?.expDate || ""}
                  onChange={(field, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: { ...prev.offerGroupDto, [field]: value },
                    }))
                  }
                />
              )}
            </div>

            {/* if group mode multi select - render effective time*/}
            <div className="grid grid-cols-2 gap-6 mb-4">
              {formData.groupType === "C" && (
                <EffectiveTimeField
                  start={formData.offerGroupDto.effDate}
                  end={formData.offerGroupDto.expDate || ""}
                  onChange={(field, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerGroupDto: { ...prev.offerGroupDto, [field]: value },
                    }))
                  }
                />
              )}
              {/* </div> */}
              {isPublic && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Share Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="shareFlag"
                        value="0"
                        checked={formData.offerGroupDto.shareFlag === "0"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            offerGroupDto: {
                              ...prev.offerGroupDto,
                              shareFlag: e.target.value,
                            },
                          }))
                        }
                        className="mr-2"
                      />
                      Subscription Plan
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="shareFlag"
                        value="1"
                        checked={formData.offerGroupDto.shareFlag === "1"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            offerGroupDto: {
                              ...prev.offerGroupDto,
                              shareFlag: e.target.value,
                            },
                          }))
                        }
                        className="mr-2"
                      />
                      Product
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="shareFlag"
                        value="2"
                        checked={formData.offerGroupDto.shareFlag === "2"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            offerGroupDto: {
                              ...prev.offerGroupDto,
                              shareFlag: e.target.value,
                            },
                          }))
                        }
                        className="mr-2"
                      />
                      Public
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
            {/* Title */}
            <div className="col-span-3 mb-2">
              <h2 className="text-lg font-semibold">Offer Information</h2>
            </div>

            {/* Kiri */}
            <div className="flex flex-col">
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
                    <SelectItem value="1">Related Product</SelectItem>
                    <SelectItem value="2">Price Plan</SelectItem>
                    <SelectItem value="3">Goods Product</SelectItem>
                    <SelectItem value="4">Default Price Plan</SelectItem>
                  </SelectContent>
                </Select>

                <label className="input input-sm flex items-center gap-2">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="w-full"
                    placeholder={`Search ${selectLabel}..`}
                  />
                  <KeenIcon icon="magnifier" />
                </label>
              </div>

              {/* List kiri */}
              <div className="border rounded-lg flex-1">
                <div className="max-h-64 overflow-y-auto">
                  {availableOffers
                    .filter((item) =>
                      item.offerName
                        ?.toLowerCase()
                        .includes(searchValue.toLowerCase()),
                    )
                    .map((offer, index) => ListItemKiri(offer, index))}
                </div>
              </div>
            </div>

            {/* Move All arrows */}
            <div className="flex flex-col items-center justify-center space-y-4 pt-10">
              <button
                onClick={() => moveAllToSelected()}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={availableOffers.length === 0}
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
              <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-2">
                <div className="h-8 flex items-center">
                  <span className="text-sm font-medium whitespace-nowrap">
                    Your Selected {selectedOffers.length} Offer
                  </span>
                </div>

                <label className="input input-sm flex items-center gap-2">
                  <input
                    type="text"
                    placeholder=""
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="w-full"
                  />
                  <KeenIcon icon="magnifier" />
                </label>
              </div>

              {/* List kanan */}
              <div className="border rounded-lg overflow-hidden flex-1">
                <div className="max-h-64 overflow-y-auto">
                  {selectedOffers.map((offer, index) => (
                    <div
                      key={index}
                      className="group p-3 border-b last:border-b-0"
                    >
                      <div className="font-medium mb-2">
                        {offer.offerName ?? ""}
                      </div>
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={offer?.defaultFlag === "Y"}
                            onChange={() =>
                              toggleOfferSelection(
                                offer?.id ?? 0,
                                "defaultFlag",
                              )
                            }
                            className="mr-1"
                          />
                          Select
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={offer?.hideFlag === "Y"}
                            onChange={() =>
                              toggleOfferSelection(offer.id ?? 0, "hideFlag")
                            }
                            className="mr-1"
                          />
                          Hidden
                        </label>

                        {/* Agreement Dropdown */}
                        <AgreementFieldsDropdown
                          offer={offer}
                          setSelectedOffers={setSelectedOffers}
                        />

                        <button
                          onClick={() => moveToAvailable(offer)}
                          className="p-1 hover:bg-gray-200 rounded ml-auto hidden group-hover:block"
                        >
                          <KeenIcon icon="minus" />
                        </button>
                      </div>
                    </div>
                  ))}
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
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            OK
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPrivateOfferGroup;
