import React, { useState } from "react";
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
import QuantityLimitField from "./group-mode-subs-plan/QuantityLimitFields";
import EffectiveTimeField from "./group-mode-subs-plan/EffectiveTimeFields";
import AgreementFieldsDropdown from "./group-mode-subs-plan/AgreementFieldsDropdown";
import {
  AvailableOffer,
  defaultSubmit,
  submit,
} from "./AddPrivateOfferGroupSubsPlan";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";

interface AddPrivateOfferGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  group?: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const AddPrivateOfferGroup: React.FC<AddPrivateOfferGroupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  group,
}) => {
  const [selectedOffers, setSelectedOffers] = useState<AvailableOffer[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const { selectedVer, servType, selectedSubSubPlan } = useOfferLayout();
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
        defaultFlag: "N",
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
      const submitData: submit = {
        ...formData,

        offerGroupId: 0,
        networkType: servType.networkType,
        offerGroupType: (parseInt(filterBy) + 2).toString(),
        offerGroupMemRequestDto: selectedOffers.map(
          (item: AvailableOffer, index) =>
            (item = {
              ...item,
              offerGroupMemId: item.offerId ?? item.dependProdSpecId,
              offerId: item.offerId,
              seq: index + 1,
              spId: 0,
              agreementPeriod: item.agreementPeriod,
              timeUnit: item.timeUnit,
              defaultFlag: item.defaultFlag,
              hideFlag: item.hideFlag,
              agreementEffType: item.agreementEffType,
              upperLimit: item.upperLimit,
              lowerLimit: item.lowerLimit,
              defaultNum: item.defaultNum,
            }),
        ),
        offerGroupDto: {
          ...formData.offerGroupDto,
          offerGroupType: (parseInt(filterBy) + 2).toString(),
          offerVerId: selectedVer?.offerVerId ?? 0,
          networkType: servType.networkType,
          indepProdSpecId: selectedSubSubPlan.indepProdSpecId,
          shareFlag: group?.shareFlag,
          // shareFlag: "N",
        },
        parentOfferGroupId: selectedSubSubPlan.offerGroupId,
      };

      // console.log(submitData, selectedSubSubPlan);

      const resp = await PostData(
        `${API_URL_OFFER}/offer/group/add-offer-group`,
        submitData,
      );

      if (resp?.status) {
        toast.success("Offer Group Data Created");
        onClose();
      } else toast.error(resp?.message || "Failed to Add Data");
      // // console.log(resp,);
    } catch (error) {
      //  console.log(error);

      toast.error("Failed to add data");
    } finally {
      setShowConfirm(false);
      // onClose();
    }
  };

  const handleSubmit = () => {
    setShowConfirm(true);
    // toast.success("test");
  };

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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex justify-between items-center border-b bg-gray-100 px-4 py-3">
          <DialogTitle>Add Private Offer Group</DialogTitle>
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
            </div>

            {/* if group mode multi select - render effective time*/}
            {formData.groupType === "C" && (
              <div className="grid grid-cols-2 gap-6 mb-4">
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
              </div>
            )}
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
