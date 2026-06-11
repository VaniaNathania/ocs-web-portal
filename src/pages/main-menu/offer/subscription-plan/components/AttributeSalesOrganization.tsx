import React, { useEffect, useState, useMemo } from "react";
import { DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import SalesOrganizationDialog from "../blocks/SalesOrganizationDialog";
import DeleteSalesOrganization from "../blocks/DeleteSalesOrganization";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { OrgData } from "./OrganizationSelector";
import { set } from "date-fns";

interface AttributeSalesOrganizationProps {
  featureChildren: any;
  fetchData: () => void;
  attributeSalesDatas: any;
  salesOrganizationData?: (data: OrgData) => void;
}

export interface AtributeDelete {
  subsPlanOfferAttrId: number;
  attrValueId: number;
  orgId: number;
  excludeFlag: string;
  spId: number;
  attrId: number;
}

const API_URL_OFFER = apiConfigOffer.offer;
const AttributeSalesOrganization: React.FC<AttributeSalesOrganizationProps> = ({
  featureChildren,
  fetchData,
  attributeSalesDatas,
}) => {
  const { DeleteData } = useCallApi();
  const [isOpenAddDialog, setIsOpenAddDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<AtributeDelete[]>([]);
  const [clearDataUi, setClearDataUi] = useState(attributeSalesDatas || []);

  useEffect(() => {
    setClearDataUi(attributeSalesDatas || []);
  }, [attributeSalesDatas]);

  const handleAdd = () => {
    setIsOpenAddDialog(true);
  };

  const handleSelect = async (row: any) => {
    //  console.log(row);
  };

  const handleDeleteClick = () => {
    // if (!seletedItems)

    // };
    setIsOpenDeleteDialog(true);
  };

  const handleDeleteUi = (deletedItems: AtributeDelete[]) => {
    setClearDataUi((UiData: any[]) => {
      return UiData.filter((item) => {
        return !deletedItems.some(
          (deleted) =>
            deleted.subsPlanOfferAttrId === item.subsPlanOfferAttrId &&
            deleted.attrValueId === item.attrValueId &&
            deleted.orgId === item.orgId,
        );
      });
    });

    setSelectedItems([]);
  };

  const handleToggleExpand = (orgId: number) => {
    setExpandedRows((prev) =>
      prev.includes(orgId) ? prev.filter((x) => x !== orgId) : [...prev, orgId],
    );
  };
  // console.log(setExpandedRows);

  // const grouped = Object.values(
  //   (attributeSalesDatas ?? []).reduce((acc: any, item: any) => {
  //     const key = item.orgId;
  //     if (!acc[key]) {
  //       acc[key] = {
  //         orgId: item.orgId,
  //         orgName: item.orgName,
  //         children: [],
  //       };
  //     }
  //     acc[key].children.push(item);
  //     return acc;
  //   }, {})
  // );
  const grouped = useMemo(() => {
    return Object.values(
      (clearDataUi ?? []).reduce((acc: any, item: any) => {
        const key = item.orgId;
        if (!acc[key]) {
          acc[key] = {
            orgId: item.orgId,
            orgName: item.orgName,
            children: [],
          };
        }
        acc[key].children.push(item);
        return acc;
      }, {}),
    );
  }, [clearDataUi]);

  useEffect(() => {
    if (grouped && grouped.length > 0) {
      const allParentIds = grouped.map((item: any) => item.orgId);
      setExpandedRows(allParentIds);
    }
  }, [grouped]);

  //  console.log("GROUPED DATA", grouped);

  return (
    <>
      <div className="shadow-md w-[300px] p-3">
        <div className="flex flex-col items-center gap-3 w-full text-sm">
          <div className="flex gap-5">
            <KeenIcon icon="data" className="rotate-90 text-green-600" />
            <h1>Sales Organization</h1>
          </div>
          <div className="mt-10 h-[300px] overflow-auto">
            {/* parent */}
            {grouped && grouped.length > 0 ? (
              <ul>
                {grouped.map((parent: any) => (
                  <li key={parent.orgId}>
                    <label>
                      <input
                        type="checkbox"
                        className="mr-1"
                        onClick={() =>
                          setSelectedItems((prev) => [
                            ...prev,
                            ...parent.children,
                          ])
                        }
                        checked={parent.children.some((child: any) =>
                          selectedItems.some(
                            (item) =>
                              item.subsPlanOfferAttrId ===
                                child.subsPlanOfferAttrId &&
                              item.attrValueId === child.attrValueId &&
                              item.orgId === child.orgId,
                          ),
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems((prev) => [
                              ...prev,
                              ...parent.children,
                            ]);
                          } else {
                            setSelectedItems((prev) =>
                              prev.filter(
                                (item) => item.orgId !== parent.orgId,
                              ),
                            );
                          }
                        }}
                      />
                      {parent.orgName}
                    </label>
                    <Button
                      variant="ghost"
                      className="p-2"
                      size="sm"
                      onClick={() => handleToggleExpand(parent.orgId)}
                    >
                      <KeenIcon
                        icon={
                          expandedRows.includes(parent.orgId) ? "down" : "right"
                        }
                      />
                    </Button>

                    {/* child */}
                    {expandedRows.includes(parent.orgId) &&
                      expandedRows.length > 0 && (
                        <ul className="ml-10 p-3">
                          {parent.children?.map((child: any) => {
                            const isSelected = selectedItems.find(
                              (item) =>
                                item.subsPlanOfferAttrId ===
                                  child.subsPlanOfferAttrId &&
                                item.attrValueId == child.attrValueId &&
                                item.orgId === child.orgId &&
                                item.excludeFlag === child.excludeFlag,
                            )
                              ? true
                              : false;

                            return (
                              <li key={child.attrValueId}>
                                <DefaultTooltip
                                  title={`${child.valueMark}`}
                                  placement="top"
                                >
                                  <div className="p-2">
                                    <label
                                      className={
                                        child.excludeFlag === "Y"
                                          ? "line-through text-gray400"
                                          : ""
                                      }
                                    >
                                      <input
                                        type="checkbox"
                                        className="mr-1"
                                        checked={isSelected}
                                        onClick={() =>
                                          setSelectedItems((prev) => [
                                            ...prev,
                                            child,
                                          ])
                                        }
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedItems((prev) => [
                                              ...prev,
                                              child,
                                            ]);
                                          } else {
                                            setSelectedItems((prev) =>
                                              prev.filter(
                                                (item) =>
                                                  !(
                                                    item.subsPlanOfferAttrId ===
                                                      child.subsPlanOfferAttrId &&
                                                    item.attrValueId ===
                                                      child.attrValueId &&
                                                    item.orgId === child.orgId
                                                  ),
                                              ),
                                            );
                                          }
                                        }}
                                      />
                                      {child.valueMark}
                                    </label>
                                  </div>
                                </DefaultTooltip>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500">No Record View</span>
            )}
          </div>
        </div>

        <div className="w-full mt-10">
          <Button variant="outline" className="w-1/2" onClick={handleAdd}>
            Add
          </Button>
          <Button
            variant="outline"
            className="w-1/2"
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </div>
      </div>

      <SalesOrganizationDialog
        isOpen={isOpenAddDialog}
        onClose={() => setIsOpenAddDialog(false)}
        featureChildren={featureChildren}
        fetchData={fetchData}
      />
      <DeleteSalesOrganization
        isOpen={isOpenDeleteDialog}
        onClose={() => setIsOpenDeleteDialog(false)}
        selectedDelete={selectedItems}
        onDeleteSuccess={handleDeleteUi}
      />
    </>
  );
};
export default AttributeSalesOrganization;
