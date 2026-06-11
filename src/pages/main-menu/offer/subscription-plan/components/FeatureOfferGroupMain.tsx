import {
  DataGridColumnHeader,
  DataGridPagination,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { Button } from "@/components/ui/button";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import {
  ButtonCursor,
  paging,
} from "@/pages/main-menu/role-management/generalUseComp";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ConditionFeature from "./DetailCategoryContent/ConditionFeature";
import { FeatureValueField } from "../blocks/group-mode-subs-plan/FeatureValueField";
import { SelectInput } from "../blocks/group-mode-subs-plan/InputValueField";

interface parentFeature {
  offerId: number;
  offerType: string;
  offerName: string;
  offerCode: string;
}

interface baseAttr {
  comments?: string;
  nullable?: string;
  defaultValue?: string;
  baseAttrId?: number | string;
  promptMsg?: string;
  valueScript?: string;
  inputType?: number | string;
  dataSourceService?: string;
  spId?: string;
  forceSelection?: string;
  mask?: string;
}

interface attrValueDtoList {
  attrValueId?: number;
  baseAttrId?: number | string;
  valueMark?: string;
  parentAttrId?: number;
  spId?: string;
  value?: number | string;
  parentAttrValueId?: number;
  seq?: string;
}

interface objecyFeatureChild {
  attrCode?: string;
  offerAttrValueDtoList?: string;
  nullable?: string;
  defaultValue?: number | string;
  excludeFlag?: string;
  attrType?: number | string;
  instantiatable?: string;
  defaultValueMark?: string;
  subsPlanOfferAttrId?: number;
  inputType?: number | string;
  attrName?: string;
  exceptionMessage?: string;
  attrCatg?: string;
  mask?: string;
  comments?: string;
  csrVisible?: string;
  attrChannel?: string;
  spId?: 0;
  operationTypes?: string;
  attrId?: number | string;
  objAttrId?: string;
  attrValueIds?: number[];
  valueIds?: string;
  baseAttr?: baseAttr;
  offerId?: number;
  offerAttrId?: number;
  valueScript?: string;
  attrValueDtoList?: attrValueDtoList[];
  dispOrder?: number | string;
}

interface objectFeature {
  offerType?: number | string;
  offerName?: string;
  children?: objecyFeatureChild[];
  offerId?: number;
  offerAttrId?: number | string;
  attrName?: string;
}

interface parentChild {
  index: string;
  parentIndex?: string;
  childIndex?: number;
  level: number;
}

interface node extends objectFeature, parentChild {}

interface props {
  payload: {
    offerId: number;
    subsPlanVerId: number;
    offerName?: string;
  };
}

interface subsPlanOfferAttrValueList {
  subsPlanOfferAttrId: number;
  attrValueId: number;
  spId: number;
}

interface subsPlanOfferAttrList {
  subsPlanOfferAttrId: number;
  offerId: number;
  attrId: number;
  defaultValue: string;
  attrValueIds: number[];
  excludeFlag: string;
  mask: string;
  exceptionMessage: string;
  subsPlanOfferAttrValueList: subsPlanOfferAttrValueList[];
  offerVerId: number;
  spId: number;
}
interface updateSubsPlan {
  showPage?: boolean;
  subsPlanVerId: number;
  subsPlanId: number;
  offerId: number;
  subsPlanOfferAttrList: subsPlanOfferAttrList[];
  spId: number;
  offerVerId: number;
}

const API_URL_OFFER = apiConfigOffer.offer;

export const FeatureOfferGroupMain = ({ payload }: props) => {
  const [selectedRow, setSelectedRow] = useState<objectFeature>();
  // const { selectedRow, setSelectedRow } = useCompList();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<node[]>([]); // Full flattened list
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { menuPrivAccess, selectedVer, selectedSubSubPlan } = useOfferLayout();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [isOpenConditionFeature, setIsOpenConditionFeature] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<node>();

  const [totalRow, setTotalRow] = useState<number>();
  const [paging, setPaging] = useState<paging>({
    search: "",
    page: 1,
    size: 5,
    sortBy: "offer_Id",
    sortDirection: "asc",
  });
  const { GetData, PostData, PutData } = useCallApi();
  const [datas, setDatas] = useState<node>();
  // Initialize state with all possible fields
  // const [editValues, setEditValues] = useState<Partial<node>>({
  //   partyName: "",
  //   url: "",
  //   privCode: "",
  //   iconUrl: "",
  // });

  // Filter suggestions from partys.privName
  const suggestions = useMemo(() => {
    if (!search) return [];

    const lowerSearch = search.toLowerCase();

    return partys.filter((p) => {
      if (p.level === 0) {
        return p.offerName?.toLowerCase().includes(lowerSearch);
      } else {
        return p.attrName?.toLowerCase().includes(lowerSearch);
      }
    });
  }, [search, partys]);

  const handleSelect = (row: node) => {
    setSearch((row.level === 0 ? row.offerName : row.attrName) ?? "");
    setShowSuggestions(false);
    setSelectedRow(row);
    // handleExpand(row);
    // console.log(row);
  };

  const handleOpenConditionFeature = async (rowData: any) => {
    //  console.log(rowData, "ROW DATA");
    const children = rowData.children.filter((item: any) =>
      rowData.index.includes(item.attrId),
    )[0];

    const hasSubsPlanOfferAttrId = children?.subsPlanOfferAttrId;

    if (!hasSubsPlanOfferAttrId) {
      await onEditConfirm(rowData, false);

      const latestPartys = await init();

      const newParent = latestPartys?.find(
        (item) => item.index === rowData.offerId?.toString(),
      );

      const newChildren = latestPartys?.find(
        (item) => item.index === `${rowData.offerId}-${children.attrId}`,
      );

      setDatas(newParent);
      setSelectedRow(newChildren);
      setIsOpenConditionFeature(true);
      return;
    }

    const parent: node | undefined = partys.find(
      (item) => item.index == rowData.offerId?.toString(),
    );

    setDatas(parent);
    setSelectedRow(children);
    setIsOpenConditionFeature(true);
  };

  const firstAPI = async () => {
    try {
      const resp = await GetData(
        `${API_URL_OFFER}/offer/common/qry-subs-plan-of-subs-plan-ver`,
        { ...payload, ...paging, offerName: search },
      );

      // console.log(resp);
      setTotalRow(resp.totalRows);
      return resp.data;
    } catch (error) {
      //  console.log(error);

      toast.error("error fetching data");
      return [];
    }
  };

  const scndAPI = async (data: parentFeature[]) => {
    try {
      const resp = await PostData(
        `${API_URL_OFFER}/offer/attr/qry-offer-attr-of-subs-plan-ver-by-page?subsPlanVerId=${selectedVer?.offerVerId ?? 0}`,
        data,
      );

      // console.log(resp);
      return resp?.data;
    } catch (error) {
      // console.log(error);

      toast.error("error fetching data");
      return [];
    }
  };

  const init = async () => {
    setIsLoading(true);
    try {
      const data1: parentFeature[] = await firstAPI();

      const data2: node[] = await scndAPI(data1);

      const mock: node[] = data2.flatMap((item) => {
        const parentNode: node = {
          ...item,
          index: item.offerId?.toString() ?? "",
          level: 0,
        };

        setExpanded((prev) =>
          new Set(prev).add(item.offerId?.toString() ?? ""),
        );

        if (item.children && item.children.length > 0) {
          const childNodes: node[] = item.children.map((child, index) => ({
            ...item, // keep parent data
            ...child, // override with child details
            index: `${item.offerId}-${child.attrId}`,
            childIndex: index,
            level: 1,
          }));
          return [parentNode, ...childNodes];
        }

        return [parentNode];
      });

      const newPartys: node[] = [...mock];

      // console.log(newPartys);

      await setPartys(newPartys);
      return newPartys;
    } catch (error) {
      //  console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    init();
  }, [paging, search]);

  const handleExpanding = (row: node) => {
    try {
      if (row.level != 0) return;
      const isExpanded = expanded.has(row.index);

      if (isExpanded) {
        setPartys((prev) =>
          prev.filter((item) => !item.index.includes(`${row.index}-`)),
        );
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(row.index);
          return copy;
        });
        return;
      } else {
        const index = partys.findIndex((p) => p.index === row.index);
        const slicebefore = partys.slice(0, index);
        const sliceafter = partys.slice(index + 1, partys.length);

        setExpanded((prev) => new Set(prev).add(row.offerId?.toString() ?? ""));
        if (row.children && row.children.length > 0) {
          const childNodes: node[] = row.children.map((child, index) => ({
            ...row, // keep parent data
            ...child, // override with child details
            index: `${row.offerId}-${child.attrId}`,
            childIndex: index,
            level: 1,
          }));
          //  console.log(slicebefore, row, childNodes, sliceafter);
          const newPartys = [...slicebefore, row, ...childNodes, ...sliceafter];
          setPartys(newPartys);
          return newPartys;
        }
      }
    } catch (error) {
      toast.error("Failed to handle expand");
      //  console.log(error);
    }
  };

  const handleEdit = (row: node) => {
    setEditingRowId(row.index);

    const parent: node | undefined = partys.find(
      (item) => item.index == row.offerId?.toString(),
    );

    setEditingFeature(row);

    //   subsPlanVerId: selectedVer?.offerVerId ?? 0,
    //   subsPlanId: parent?.offerId ?? 0,
    //   offerId: parent?.offerId ?? 0,
    //   subsPlanOfferAttrList:
    //     parent?.children?.map((item: any) => ({
    //       offerVerId: selectedVer?.offerVerId ?? 0,
    //       attrId: item.attrId,
    //       attrValueIds: item.attrValueIds,
    //       defaultValue: item.defaultValue,
    //       exceptionMessage: "",
    //       excludeFlag: "N",
    //       mask: "",
    //       offerId: item.offerId,
    //       spId: 0,
    //       subsPlanOfferAttrId: item.subsPlanOfferAttrId,
    //       subsPlanOfferAttrValueList: item.attrValueDtoList?.map((list: any) => ({
    //         subsPlanOfferAttrId: item.subsPlanOfferAttrId,
    //         attrValueId: list.attrValueId,
    //         spId: 0,
    //       })),
    //     })) ?? [],
    //   spId: 0,
    //   offerVerId: selectedVer?.offerVerId ?? 0,
    // });
  };

  const onEditConfirm = async (row: node, showToast: boolean) => {
    const payload = {
      showPage: false,
      subsPlanVerId: selectedVer.offerVerId,
      subsPlanId: selectedSubSubPlan.subsPlanId,
      offerId: selectedSubSubPlan.offerId,
      subsPlanOfferAttrList: row.children?.map(
        (item: any) =>
          (item = {
            subsPlanOfferAttrId: item.subsPlanOfferAttrId,
            offerId: item.offerId,
            attrId: item.attrId,
            defaultValue: item.defaultValue,
            attrValueIds: item.attrValueIds,
            excludeFlag: item.excludeFlag,
            mask: item.mask,
            exceptionMessage: item.exceptionMessage,
            subsPlanOfferAttrValueList: item.attrValueDtoList?.map(
              (attr: any) =>
                (attr = {
                  subsPlanOfferAttrId: attr.subsPlanOfferAttrId,
                  attrValueId: attr.attrValueId,
                  spId: 0,
                }),
            ),
            offerVerId: selectedVer.offerVerId,
            spId: 0,
          }),
      ),
      spId: 0,
      offerVerId: selectedVer.offerVerId,
    };

    // console.log(payload, row, selectedSubSubPlan);
    //  console.log(payload);
    try {
      const resp = await PutData(
        API_URL_OFFER +
          `/offer/subs-plan/${payload.subsPlanVerId}/offer-feature/${payload.offerId}`,
        payload,
      );

      if (!resp?.status) {
        if (showToast) toast.error(resp?.message);
        return resp;
      }
      setEditingRowId(null);
      init();
      if (showToast) toast.success(resp.message);

      return resp;
    } catch (error) {}
  };

  const [isBaseVal, setIsBaseVal] = useState<boolean>(false);
  const toggleOnlyBaseValue = () => {
    if (!isBaseVal) {
      setIsBaseVal(true);
    } else {
      setIsBaseVal(false);
      init();
    }
  };

  // Column
  const AvailableColumn = useMemo<ColumnDef<node>[]>(
    () => [
      {
        // accessorFn: (row) => row.offerName,
        id: "featureName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Feature Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
        // featureName column
        cell: ({ row }) => {
          const data = row.original;
          const isExpand = expanded.has(row.original.index);
          const isParent = data.level === 0; // fix naming
          const nameParent = data.offerName;
          const nameChild = data.children?.find(
            (item) => `${item.offerId}-${item.attrId}` === data.index,
          )?.attrName;
          // const isSelected = data.index === selectedRow?.index;
          const name = (!isParent ? nameChild : nameParent) ?? "";

          return (
            <DefaultTooltip placement="top" title={name}>
              <div
                style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
                onClick={() => handleExpanding(data)}
              >
                <KeenIcon
                  icon={isParent ? (isExpand ? "down" : "right") : "menu"}
                  className="inline-block mx-2"
                />
                {name}
              </div>
            </DefaultTooltip>
          );
        },

        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
          cellClassName: "max-w-[300px] text-elipsis overflow-hidden",
        },
      },
      {
        // accessorFn: (row) => row.url,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Feature Default Value" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        // url column
        cell({ row }) {
          const data = row.original;
          const isParent = data.level === 0;
          const isEditing = editingRowId === data.index;

          if (isParent) return null;

          const attrId = data.index.replace(`${data.offerId?.toString()}-`, "");
          const childData = data.children?.find(
            (item) => item.attrId == attrId,
          );
          // setEditingFeature(childData);
          if (!childData) return null;

          if (childData?.attrValueDtoList) {
            const childDataBaseAtr = childData.attrValueDtoList.find(
              (item) => item.value === childData.defaultValue,
            );

            if (!childData.attrValueIds) {
              if (!childData.valueIds) {
                childData.attrValueIds = childData.attrValueDtoList
                  .map((item) => {
                    if (childData.defaultValue === item.value)
                      return item.attrValueId;
                  })
                  .filter((id): id is number => id !== undefined);
              } else {
                childData.attrValueIds = childData.valueIds
                  .split("|")
                  .map((item) => parseInt(item));
              }
            }

            if (isEditing) {
              // console.log(childData.inputType);
              if (childData.inputType == 4) {
                return (
                  // <Input
                  //   type="text"
                  //   value={childData.defaultValue || ""}
                  //   onChange={(e) => {
                  //     const newValue = e.target.value;

                  //     // ✅ Prepare the new updated array first
                  //     const updatedPartys = partys.map((partyItem) => {
                  //       if (partyItem.index !== data.index) return partyItem;

                  //       return {
                  //         ...partyItem,
                  //         children: (partyItem.children ?? []).map((child) => {
                  //           if (child.attrId === childData.attrId) {
                  //             return {
                  //               ...child,
                  //               defaultValue: newValue,
                  //               defaultValueMark: newValue,
                  //             };
                  //           }
                  //           return child;
                  //         }),
                  //       };
                  //     });

                  //     // ✅ Only then update state once
                  //     setPartys(updatedPartys);
                  //   }}
                  // />
                  <SelectInput
                    childData={childData}
                    data={data}
                    setPartys={setPartys}
                  />
                );
              }

              return (
                <FeatureValueField rowData={data} setRowData={setPartys} />
                // <FeatureValueField
                //   rowData={data}
                //   setRowData={setPartys}
                //   editingFeature={editingFeature}
                //   setEditingFeature={setEditingFeature}
                // />
              );
            }

            if (childData.inputType == 4) return childData.defaultValue;

            return (
              <div className="flex-1 flex flex-row items-center gap-1 overflow-hidden">
                {childData.attrValueDtoList
                  .filter((item: any) =>
                    childData.attrValueIds?.includes(item.attrValueId ?? 0),
                  )
                  .map((item: any) => (
                    <DefaultTooltip
                      title={`${item.valueMark}(${item.value})`}
                      placement="top"
                    >
                      <div
                        key={item.attrValueId}
                        className={`flex-shrink min-w-0 px-2 py-1 rounded-md transition-all duration-300 ${item.value === childData.defaultValue ? "bg-blue-500 text-white" : ""}`}
                      >
                        <span className="truncate block max-w-[120px]">
                          {item.valueMark}
                          {`(${item.value})`}
                        </span>
                      </div>
                    </DefaultTooltip>
                  ))}
              </div>
            );
          }
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
          cellClassName: "max-w-[100px] text-elipsis overflow-hidden",
        },
      },
      {
        // accessorFn: (row) => row.privCode,
        id: "privCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="csrVisible" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          const data = row.original;
          const isEditing = editingRowId === data.index;
          const isChild = data.level !== 0;

          if (!isChild) return;
          const attrId = data.index.replace(`${data.offerId?.toString()}-`, "");
          const childData = data.children?.find(
            (item) => item.attrId == attrId,
          );
          if (!childData) return null;

          return (
            <KeenIcon
              icon={`${childData.csrVisible === "Y" ? "eye" : "eye-slash"}`}
            />
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
          cellClassName: "text-elipsis overflow-hidden text-center",
        },
      },
      {
        // accessorFn: (row) => row.iconUrl,
        id: "instant",
        header: ({ column }) => (
          <DataGridColumnHeader title="Instatination" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          const data = row.original;
          const isEditing = editingRowId === data.index;
          const isChild = data.level !== 0;

          if (!isChild) return;
          const attrId = data.index.replace(`${data.offerId?.toString()}-`, "");
          const childData = data.children?.find(
            (item) => item.attrId == attrId,
          );
          if (!childData) return null;

          return (
            <KeenIcon
              icon={`${childData.instantiatable === "Y" ? "check" : "cross"}`}
            />
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
          cellClassName: " text-elipsis overflow-hidden text-center",
        },
      },
      {
        // accessorFn: (row) => row.iconUrl,
        id: "unavailable",
        header: ({ column }) => (
          <DataGridColumnHeader title="Unavailable" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          const data = row.original;
          const isEditing = editingRowId === data.index;
          const isChild = data.level !== 0;

          if (!isChild) return;
          const attrId = data.index.replace(`${data.offerId?.toString()}-`, "");
          const childData = data.children?.find(
            (item) => item.attrId == attrId,
          );
          if (!childData) return null;

          return (
            <input
              type="checkbox"
              disabled={!isEditing}
              checked={childData.excludeFlag === "Y"}
              onChange={() => {
                setPartys((prev) =>
                  prev.map((partysItem) => {
                    if (partysItem.index !== data.index) return partysItem;

                    const newChild = (partysItem.children ?? []).map(
                      (child) => {
                        if (child.attrId === childData.attrId) {
                          const update: objecyFeatureChild = {
                            ...child,
                            excludeFlag: child.excludeFlag === "Y" ? "N" : "Y",
                          };

                          return update;
                        }

                        return child;
                      },
                    );

                    const newItems = {
                      ...partysItem,
                      children: newChild,
                    };

                    return newItems;
                  }),
                );
              }}
            />
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
          cellClassName: " text-elipsis overflow-hidden text-center",
        },
      },
      {
        // accessorFn: (row) => row.iconUrl,
        id: "condition",
        header: ({ column }) => (
          <DataGridColumnHeader title="Condition" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          const data = row.original;
          const attrId = data.index.replace(`${data.offerId?.toString()}-`, "");
          const childData = data.children?.find(
            (item) => item.attrId == attrId,
          );
          if (!childData) return null;
          const isDisable = childData.excludeFlag === "Y";
          if (row.original.level === 0) return;
          return (
            // <Button variant={"ghost"} size={"sm"} onClick={() => handleOpenConditionFeature(data)} disabled={isDisable} className={`${isDisable ? "cursor-not-allowed" : "cursor-pointer"}`}>
            //   condition
            // </Button>
            <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
            <ButtonCursor
              variant="ghost"
              disable={isDisable}
              onClick={() => handleOpenConditionFeature(data)}
              title="Condition"
              size="sm"
            >
              Condition
            </ButtonCursor>
            </AccessWrapper>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
          cellClassName: " text-elipsis overflow-hidden text-center",
        },
      },
      {
        id: "options",
        // size: 300,
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Options"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const data = row.original;
          // const isDisable = data.partyId === 0;
          const isEditing = editingRowId === data.index;
          const isParent = data.level === 0;

          // if (isDisable) return;

          if (isParent) return;

          return (
            <div className="flex items-center justify-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    // onClick={handleSave}
                    onClick={() => {
                      onEditConfirm(data, true);
                      // console.log(data);
                    }}
                  >
                    <KeenIcon icon="check" />
                  </Button>
                  <Button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    onClick={() => {
                      setEditingRowId(null);
                      // console.log(editingFeature);

                      setPartys((prev) =>
                        prev.map((item) => {
                          if (item.index === editingFeature?.index)
                            return editingFeature;
                          return item;
                        }),
                      );
                    }}
                  >
                    <KeenIcon icon="cross" />
                  </Button>
                </>
              ) : (
                <>
                  <AccessWrapper
                    hasAccess={menuPrivAccess?.editStatus}
                    enabledText="Edit"
                  >
                    <Button
                      className="btn btn-sm btn-icon btn-clear btn-light"
                      onClick={() => handleEdit(data)}
                    >
                      <KeenIcon icon="notepad-edit" />
                    </Button>
                  </AccessWrapper>
                </>
              )}
            </div>
          );
        },

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100 w-[100px]",
        },
      },
    ],
    [expanded, editingRowId],
  );
  const filteredPartys = useMemo(() => {
    if (!isBaseVal) return partys;

    return partys.filter(
      (item) =>
        item.level === 0 ||
        (item.children && item.children[item.childIndex ?? 0]?.defaultValue),
    );
  }, [partys, isBaseVal]);

  // Then update doGetDirectoryPortalData to use the already-filtered data
  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number) => {
      if (page != paging.page || limit !== paging.size) {
        // console.log(page, limit);
        setPaging((prev) => ({ ...prev, page: page, size: limit }));
      }

      return {
        data: filteredPartys,
        totalCount: totalRow, // You might want to adjust this to filteredPartys.length
      };
    },
    [filteredPartys, paging.page, paging.size, totalRow],
  );

  return (
    <div className="bg-white p-5 mx-5 rounded-md space-y-2">
      <div className="w-full flex flex-row gap-2">
        <div className="w-1/2 flex flex-row items-center gap-2">
          <input type="checkbox" onChange={toggleOnlyBaseValue} />
          <label>Only Show Features with default value</label>
        </div>
        <div className="flex flex-col w-1/2 relative">
          <label className="input input-sm w-full flex items-center gap-2">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Feature Name.."
              className="w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                // setShowSuggestions(true);
              }}
              // onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // delay so click still works
              // onFocus={() => search && setShowSuggestions(true)}
            />
          </label>

          {/* Suggestions Dropdown */}
        </div>
      </div>

      <div className="relative">
        {(isLoading || isExpanding) && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${search}`} // Remove isBaseVal from key
          columns={AvailableColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "featureName", desc: false }]}
          serverSide={true}
          data={filteredPartys} // Use filtered data here
          onFetchData={({ pageIndex, pageSize }) => {
            return doGetDirectoryPortalData(pageIndex + 1, pageSize);
          }}
        >
          <div className="h-full overflow-y-auto w-full border-2">
            <DataGridTable />
          </div>
          <DataGridPagination />
        </DataGridProvider>
      </div>

      <ConditionFeature
        isOpen={isOpenConditionFeature}
        onClose={() => setIsOpenConditionFeature(false)}
        featureChildren={selectedRow}
        featureParent={datas}
        fetchData={init}
      />
    </div>
  );
};
