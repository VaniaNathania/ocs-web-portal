import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ButtonCursor,
  ParentChildNode,
  PopUpDialog,
  PopUpProps,
} from "@/pages/main-menu/role-management/generalUseComp";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddPrivateOfferGroup, {
  AvailableOffer,
  OfferGroupMem,
} from "../blocks/AddPrivateOfferGroup";
import { useOfferGroupHook } from "../hooks/useOfferGroupHooks";
import { useMainProductOfferListContext } from "../hooks";
import DealOfferGroupSubsPlan from "../../subscription-plan/blocks/DealOfferGroupSubsPlan";
import { JoinSubsPlan } from "../../subscription-plan/components/JoinSubsPlan";
import { MergeInformation } from "./MergeInformation";
import AgreementFieldsDropdownPrivateOfferGroup from "../blocks/group-mode/AgreementFieldsDropdownOnPrivateOfferGroup";

interface PrivateOfferGroupContentProps {
  rowData: any;
  rowParent: OfferGroupNode[];
  type: "3" | "4" | "5" | "6";
  initFunct: (item: any) => void;
}

export interface OfferGroupData {
  groupName: string;
  groupMode: string;
  isNecessary: string;
  defaultValue: string;
  csrVisible: string;
  agreementPeriod: string;
  feature: string;
}

export interface OfferGroupDataNew {
  offerGroupId?: number;
  offerGroupName?: string;
  offerGroupCode?: string;
  offerGroupType?: string;
  groupType?: string;
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
  spId?: number;
  offerVerId?: number;
  networkType?: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

interface offerGroupParent {
  comments: string | null;
  effDate: string;
  expDate: string | null;
  groupType: "B" | "C";
  indepProdSpecId: number | null;
  // lowerLimit: any | null;
  necessary: "0" | "1";
  offerGroupCode: any | null;
  offerGroupId?: number;
  offerGroupName?: string;
  offerGroupType?: string;
  offerSubsPlanVerId: any | null;
  offerVerId: number;
  seq?: number;
  shareFlag: string;
  state: "A" | "X";
  // upperLimit: any | null;
  child?: OfferGroupNode[];
}

interface offerGroupMemIn {
  offerGroupMemId?: number;
  offerGroupId?: number;
  offerId?: number;
  networkType?: string;
  networkTypeName?: string;
  isPackage?: "N" | "Y";
  defaultFlag?: string;
  quantity?: any | null;
  saleListPrice?: any | null;
  offerGroupType?: string;
  offerEffDate?: string;
  offerExpDate?: string;
  packageMemList: any | null;
}

interface OfferGroupNode
  extends offerGroupParent,
    ParentChildNode,
    offerGroupMemIn,
    OfferGroupMem,
    AvailableOffer {}

type DialogType = "add" | string | null;

// const API_URL_OFFER = apiConfigOffer.offer;

const PrivateOfferGroupChildContent: React.FC<
  PrivateOfferGroupContentProps
> = ({ rowData, rowParent, type, initFunct }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [isPublicOfferGroupOpen, setIsPublicOfferGroupOpen] = useState(false);
  const { GetData, PutData, DeleteData } = useCallApi();
  const [selectedGroup, setSelectedGroup] = useState<OfferGroupNode>();
  const [isDetailOfferGroupOpen, setIsDetailOfferGroupOpen] = useState(false);
  const [selectedDir, setSelectedDir] = useState<OfferGroupNode>();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<OfferGroupNode[]>([]); // Full flattened list

  const [expanded, setExpanded] = useState<Set<number>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { menuPrivAccess } = useOfferLayout();
  const [editPayload, setEditPayload] = useState<any>();
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [alert, setAlert] = useState<boolean>(false);
  const { setDetailData } = useOfferGroupHook();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [selectedToDeal, setSelectedToDeal] = useState<OfferGroupNode>();
  const [formEdit, setFormEdit] = useState<OfferGroupNode>();

  const [dialogProps, setDialogProps] = useState<PopUpProps>({
    isOpen: alert,
    handleDialog: () => {
      setAlert(false);
    },
    type: "alert",
    desc: "",
    title: "Error",
  });

  const handleEditClick = (row: OfferGroupNode) => {
    setFormEdit(row);
    setEditingRowId(row.index);
  };

  const { selectedVer } = useOfferLayout();

  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [deleteNode, setDeleteNode] = useState<OfferGroupNode>();
  const [showJoin, setShowJoin] = useState<boolean>(false);
  const [showMergeInfo, setShowMergeInfo] = useState<boolean>(false);

  const initializeData = async () => {
    setIsLoading(true);
    // setEditingRowId(null)
    expanded.clear();
    // await initFunct(type);

    const data: OfferGroupNode[] = rowParent;
    // console.log(data);

    const parent: OfferGroupNode[] = data
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
      .map(
        (item) =>
          (item = {
            ...item,
            indepProdSpecId: rowData.indepProdSpecId,
            index: item?.offerGroupId ?? 0,
            parentIndex: 0,
            isChild: false,
            level: 0,
          }),
      );

    const newPartys: OfferGroupNode[] = [...parent];

    // console.log(newPartys);

    try {
      setPartys(newPartys);
      // setSelectedDir(newPartys[0]);
      // setExpanded((prev) => new Set(prev).add(0));

      hasFetched.current = true;
    } catch (error) {
      toast.error("Failed on initializing data");
    } finally {
      setIsLoading(false);
      setDetailData(rowData);

      if (data.length > 0) handleExpand(newPartys[0]);
    }
  };

  const handleDelete = (item: OfferGroupNode) => {
    setDeleteNode(item);
    setShowDelete(true);
  };

  const onDelSubsPlanSelect = async () => {
    try {
      const submitData = {
        offerGroupMemId: deleteNode?.offerGroupMemId,
        offerGroupId: deleteNode?.offerGroupId,
      };

      const response = await DeleteData(
        `${API_URL_OFFER}${deleteNode?.level === 0 ? `/offer/group/del-offer-group/${submitData.offerGroupId}` : `/offer/group/delete-offer-group-mem?offerGroupMemId=${submitData.offerGroupMemId}`}`,
        // submitData
        {},
      );

      if (response?.status) {
        toast.success(response.message);
      } else toast.error(response?.message);

      // console.log(submitData, nodeToDel);
    } catch (error) {
      console.error(error);
    } finally {
      setShowDelete(false);
      initFunct(type);
    }
  };

  // useEffect(() => {
  // //  console.log("INI DATANYA", rowData);
  // }, [rowData]);

  const handleShowAddDialog = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
  }, []);

  const handleShowPublicOfferGroup = useCallback((open: boolean) => {
    setIsPublicOfferGroupOpen(open);
  }, []);

  const handleDeal = async (node: OfferGroupNode) => {
    // console.log(node.offerGroupName);
    await handleExpand(node).then(() => setIsDealDialogOpen(true));
  };

  const handleMergeInfo = async (node: OfferGroupNode) => {
    // console.log(node.offerGroupName);
    await handleExpand(node).then(() => setShowMergeInfo(true));
  };

  const suggestions = useMemo(() => {
    if (!search) return [];
    return partys.filter((p) => p.offerGroupName).slice(0, 8);
  }, [search, partys]);

  const handleSelect = (row: OfferGroupNode) => {
    setSearch(row.offerGroupName ?? "");
    setShowSuggestions(false);
    setSelectedDir(row);
    handleExpand(row);
    // console.log(row);
  };

  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    // console.log(rowData, "ini");
    if (isDealDialogOpen || isAddDialogOpen) return;
    initializeData();
  }, [selectedVer, rowParent, isDealDialogOpen, isAddDialogOpen]);

  const prevDealRef = useRef(isDealDialogOpen);
  const prevAddRef = useRef(isAddDialogOpen);

  useEffect(() => {
    const prevDealOpen = prevDealRef.current;
    const prevAddOpen = prevAddRef.current;

    // If previously open and now closed → trigger init
    if (
      (prevDealOpen && !isDealDialogOpen) ||
      (prevAddOpen && !isAddDialogOpen)
    ) {
      initFunct(type);
    }

    // update previous values
    prevDealRef.current = isDealDialogOpen;
    prevAddRef.current = isAddDialogOpen;
  }, [isDealDialogOpen, isAddDialogOpen, type]);

  const fetchChild = async (
    offerGroupId: number,
    level: number = 1,
    // offerGroupId: number
  ): Promise<OfferGroupNode[]> => {
    const temp = await fetchChildResponse(offerGroupId);
    const child: OfferGroupNode[] = temp.map(
      (item: OfferGroupNode, index) =>
        (item = {
          ...item,
          index: offerGroupId * 100 + index,
          parentIndex: offerGroupId,
          level: level + 1,
          isChild: item.offerGroupId ? false : true,
        }),
    );

    // console.log(child);

    return child;
  };

  const fetchChildResponse = async (
    index: number,
  ): Promise<OfferGroupNode[]> => {
    try {
      const param = {
        offerGroupId: index,
      };
      const response = await GetData(
        `${API_URL_OFFER}/offer/depend/qry-depend-group-mem`,
        param,
      );

      const responseData = response.data;

      return responseData;
    } catch (error) {
      return [];
    }
  };

  // Recursively remove all children of given parentIndex
  const removeChildrenRecursively = (
    data: OfferGroupNode[],
    parentIndex: number,
  ): OfferGroupNode[] => {
    // console.log(parentIndex);

    const childIds = new Set<number>();
    const collectChildren = (id: number) => {
      data.forEach((item) => {
        if (item.parentIndex === id) {
          // console.log(item);
          if (!item.isChild) {
            setExpanded((prev) => {
              const copy = new Set(prev);
              copy.delete(item.index);
              return copy;
            });
          }
          childIds.add(item.index);
          collectChildren(item.index); // Recursively collect
        }
      });
    };
    collectChildren(parentIndex);

    // console.log(childIds, data);

    return data.filter((item) => !childIds.has(item.index));
  };

  const handleExpand = async (row: OfferGroupNode) => {
    setIsExpanding(true);
    setSelectedDir(row);
    // let rowIndex = 0;

    // console.log(row);

    try {
      const isExpanded = expanded.has(row.index);
      // console.log(row);

      if (isExpanded) {
        setPartys((prev) =>
          removeChildrenRecursively(prev, row.offerGroupId ?? 0),
        );
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(row.index);
          return copy;
        });
        if (!row.isChild) setSelectedGroup(row);
      } else {
        let children: OfferGroupNode[] = [];
        if (!row.isChild) {
          // setAvailableComponents([]);
          // console.log(row.child);

          let temp: OfferGroupNode[] = [];
          if (!row.child)
            temp = await fetchChild(row.offerGroupId ?? 0, row.level ?? 0);
          else temp = row?.child;
          // row.child = [...temp]

          // console.log(temp);

          children = [...temp];
          setExpanded((prev) => new Set(prev).add(row.index));
        }
        setPartys((prev) => {
          const index = prev.findIndex((p) => p.index === row.index);

          // replace parent immutably
          const updated = prev.map((p, i) =>
            i === index ? { ...p, child: children } : p,
          );

          // only insert children if not already present
          const alreadyInserted = updated.some(
            (p, i) => i > index && children.some((c) => c.index === p.index),
          );

          if (!alreadyInserted) {
            updated.splice(index + 1, 0, ...children);
          }

          if (!row.isChild) setSelectedGroup(updated[index]);

          return updated;
        });
      }
    } catch (error) {
      toast.error("Failed to expand directory");
    } finally {
      setIsExpanding(false);
    }
  };

  const handleShowConfirmForEdit = (row: OfferGroupNode) => {
    setShowConfirm(true);
  };

  const onEdit = async () => {
    // console.log(formEdit);
    const payload = {
      ...formEdit,
      offerGroupId: formEdit?.parentIndex,
    };

    try {
      const response = await PutData(
        `${API_URL_OFFER}/offer/group/mod-offer-group-mem`,
        payload,
      );

      if (response?.status) {
        toast.success(response.message);
      } else toast.error(response?.message);
    } catch (error) {
      toast.error("Failed to update data");
      console.error(error);
    } finally {
      setShowConfirm(false);
      setEditingRowId(null);
      setEditPayload(null);
      initFunct(type);
    }
  };

  const handleJoin = (node: OfferGroupNode) => {
    handleExpand(node);
    setShowJoin(true);
  };

  const handleAdd = (node: OfferGroupNode) => {
    handleExpand(node);
    setIsAddDialogOpen(true);
  };

  // Column
  const column = useMemo<ColumnDef<OfferGroupNode>[]>(
    () => [
      {
        accessorFn: (row) => row.offerGroupName,
        id: "offerGroupName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Offer Group Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const data = row.original;
          const isExpand = expanded.has(row.original.index);
          const isDir = !data.isChild;

          return (
            <DefaultTooltip placement="top" title={data.offerGroupName}>
              <div
                style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
                // className={
                //   selectedDir?.index === data.index
                //     ? selectedRowHigligt +
                //       " cursor-pointer transition-colors duration-1000  w-full overflow-hidden text-ellipsis whitespace-nowrap"
                //     : "cursor-pointer transition-colors duration-1000  w-full overflow-hidden text-ellipsis whitespace-nowrap"
                // }
                // onClick={() => handleExpand(data)}
              >
                <KeenIcon
                  icon={isDir ? "right" : "menu"}
                  className={`inline-block mx-2 transition-transform duration-1000 ${isExpand ? "rotate-90" : ""}`}
                />
                {data.offerGroupName ?? data.offerName}
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
        accessorFn: (row) => row.defaultFlag,
        id: "defaultFlag",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Default Value"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original.defaultFlag;
          const bool = data === "Y";
          const handleToggle = () => {
            if (formEdit)
              setFormEdit((val) => {
                if (val) {
                  const update: OfferGroupNode = {
                    ...val,
                    defaultFlag: val.defaultFlag === "Y" ? "N" : "Y",
                  };
                  return update;
                }

                return val;
              });
            // row.original.defaultFlag = bool ? "N" : "Y";
          };
          const isDisable = editingRowId !== row.original.index;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                // checked={bool}
                defaultChecked={
                  isDisable ? bool : formEdit?.defaultFlag === "Y"
                }
                onChange={handleToggle}
                disabled={isDisable}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
      },
      {
        // accessorFn: (row) => row.csrVisible,
        id: "csrVisible",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Visible" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original.hideFlag;
          const bool = data === "Y";
          const handleToggle = () => {
            if (formEdit)
              setFormEdit((val) => {
                if (val) {
                  const update: OfferGroupNode = {
                    ...val,
                    hideFlag: val.hideFlag === "Y" ? "N" : "Y",
                  };
                  return update;
                }

                return val;
              });
            // row.original.defaultFlag = bool ? "N" : "Y";
          };
          const isDisable = editingRowId !== row.original.index;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                // checked={bool}
                defaultChecked={isDisable ? bool : formEdit?.hideFlag === "Y"}
                onChange={handleToggle}
                disabled={isDisable}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
      },
      {
        // accessorFn: (row) => row.agreementPeriod,
        id: "agreementPeriod",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Agreement Period"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const data = row.original;
          const isDisable = editingRowId !== row.original.index;

          if (!data.isChild) return;
          if (!isDisable)
            return (
              <AgreementFieldsDropdownPrivateOfferGroup
                offer={formEdit}
                setSelectedOffers={setFormEdit}
              />
            );
          return (
            <AgreementFieldsDropdownPrivateOfferGroup
              offer={data}
              setSelectedOffers={setFormEdit}
            />
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "Options",
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
          const defaultNecessary = row.original.necessary;
          const isDefault = row.original.offerGroupType === "6";
          if (row.original.level != 0) {
            if (row.original.index === editingRowId)
              return (
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    onClick={() => {
                      // console.log(row.original);
                      handleShowConfirmForEdit(row.original);
                    }}
                    // title="Edit"
                  >
                    <KeenIcon icon="check" />
                  </button>
                  <button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    //  onClick={() => handleDeleteDialog(feature.offerGroupId, feature.attrId)}
                    onClick={() => {
                      setEditingRowId(null);
                      row.original.necessary = defaultNecessary;
                    }}
                    // title="Delete"
                  >
                    <KeenIcon icon="cross" />
                  </button>
                </div>
              );

            return (
              <div className="flex items-center justify-center gap-2">
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => {
                    handleEditClick(row.original);
                  }}
                  title="Edit"
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  //  onClick={() => handleDeleteDialog(feature.offerGroupId, feature.attrId)}
                  onClick={() => handleDelete(row.original)}
                  title="Delete"
                >
                  <KeenIcon icon="trash" />
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  handleDeal(row.original);
                }}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                //  onClick={() => handleDeleteDialog(feature.offerGroupId, feature.attrId)}
                onClick={() => handleDelete(row.original)}
                title="Delete"
              >
                <KeenIcon icon="trash" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                //  onClick={() => handleDeleteDialog(feature.offerGroupId, feature.attrId)}
                onClick={() => handleMergeInfo(row.original)}
                title="Merge Information"
              >
                <KeenIcon icon="menu" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                //  onClick={() => handleDeleteDialog(feature.offerGroupId, feature.attrId)}
                onClick={() => handleJoin(row.original)}
                title="Join Subsplan"
              >
                <KeenIcon icon="notepad" />
              </button>
              {!isDefault && (
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  //  onClick={() => handleDeleteDialog(feature.offerGroupId, feature.attrId)}
                  onClick={() => handleAdd(row.original)}
                  title="Add child offer group"
                >
                  <KeenIcon icon="plus" />
                </button>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [expanded, selectedDir?.index, editingRowId, partys],
  );

  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number) => {
      return {
        data: partys,
        totalCount: partys.length,
      };
    },
    [partys, search, rowData], // Proper dependencies
  );

  return (
    <div className="bg-white">
      <PopUpDialog
        isOpen={showConfirm}
        desc="Edit data?"
        handleDialog={setShowConfirm}
        onConfirm={onEdit}
        bgOn={false}
      />

      <PopUpDialog
        isOpen={showDelete}
        desc="Delete data?"
        handleDialog={setShowDelete}
        onConfirm={onDelSubsPlanSelect}
        bgOn={false}
        // asdasd
      />

      <DealOfferGroupSubsPlan
        isOpen={isDealDialogOpen}
        onClose={() => setIsDealDialogOpen(false)}
        group={selectedGroup}
      />

      <JoinSubsPlan
        isOpen={showJoin}
        handleOpen={setShowJoin}
        payload={{
          offerGroupId: selectedGroup?.offerGroupId ?? 0,
          offerGroupType: selectedGroup?.offerGroupType ?? "3",
          indepProdSpecId: selectedGroup?.indepProdSpecId ?? 0,
          networkType: selectedGroup?.networkType ?? "",
          spId: 0,
        }}
      />

      <MergeInformation
        isOpen={showMergeInfo}
        handleIsOpen={setShowMergeInfo}
        payload={{ offerGroupId: selectedGroup?.offerGroupId ?? 0 }}
        rowData={selectedGroup}
      />

      <AddPrivateOfferGroup
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        group={selectedGroup}
        rowData={rowData}
        isPublic={false}
        isParent={true}
      />

      {/* Data Grid Offer Group */}
      <div className="">
        <DataGridProvider
          key={`datagrid-${partys.length}`}
          columns={column}
          pagination={{ size: partys.length }}
          data={partys}
          // getSubRows={(row) => row.subRow ?? []}
          layout={{ card: true }}
          // sorting={[{ id: "featureName", desc: false }]}
          serverSide={false}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetDirectoryPortalData(pageIndex + 1, pageSize);
          }}
          getRowProps={(row) => ({
            className:
              row.original.index === selectedDir?.index
                ? selectedRowHighLight
                : nonSelectedRowHighLight,
            onClick: () => handleExpand(row.original),
          })}
        >
          <div className="border-[1px] rounded-lg ">
            {/* <OfferGroupToolbar /> */}
            <div className="overflow-y-auto">
              <DataGridTable />
            </div>
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};

export default PrivateOfferGroupChildContent;
