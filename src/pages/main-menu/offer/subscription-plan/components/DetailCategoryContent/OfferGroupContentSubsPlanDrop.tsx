import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import PublicOfferGroup from "./PublicOfferGroupSubsPlan";
import { useSubscriptionPlanOfferListContext } from "../../hooks/useSubscriptionPlanOfferListContext";
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
import AddPrivateOfferGroupSubsPlan, {
  AvailableOffer,
  OfferGroupMem,
} from "../../blocks/AddPrivateOfferGroupSubsPlan";
import SelectOfferGroupSubsPlan from "../../blocks/SelectOfferGroupSubsPlan";
import DealOfferGroupSubsPlan from "../../blocks/DealOfferGroupSubsPlan";
import DetailOfferGroupDialog from "../../blocks/DetailOfferGroupDialog";
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
import { useOfferGroupHook } from "../../hooks/useOfferGroupHooks";
import { FeatureOfferGroupContent } from "../FeatureOfferGroupContent";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface OfferGroupContentSubsPlanProps {
  rowData: any;
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
  csrVisible?: "Y" | "N";
  quantity?: any | null;
  saleListPrice?: any | null;
  offerGroupType?: string;
  offerEffDate?: string;
  offerExpDate?: string;
  packageMemList: any | null;
  agreementPeriod?: number;
  agreementEffType?: "1" | "2" | "3" | "4";
  timeUnit?: "D" | "M" | "W" | "Y";
}

interface OfferGroupNode
  extends offerGroupParent,
    ParentChildNode,
    offerGroupMemIn,
    OfferGroupMem,
    AvailableOffer {}

type DialogType = "add" | string | null;

// const API_URL_OFFER = apiConfigOffer.offer;

const agreementEffType = {
  "1": "Next Day",
  "2": "Next Month",
  "3": "Next Billing Cycle",
  "4": "Today 0:00",
};

const timeUnit = {
  D: "Day",
  M: "Month",
  W: "Week",
  Y: "Year",
};

const OfferGroupContentSubsPlanNode: React.FC<
  OfferGroupContentSubsPlanProps
> = ({ rowData }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [isPublicOfferGroupOpen, setIsPublicOfferGroupOpen] = useState(false);
  const { GetData, PutData, DeleteData } = useCallApi();
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [isDetailOfferGroupOpen, setIsDetailOfferGroupOpen] = useState(false);
  const [selectedDir, setSelectedDir] = useState<OfferGroupNode>();
  const [selectedMem, setSelectedMem] = useState<OfferGroupNode>();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<OfferGroupNode[]>([]); // Full flattened list
  const [expanded, setExpanded] = useState<Set<number>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { menuPrivAccess, selectedSubSubPlan, selectedVer } = useOfferLayout();
  const [editPayload, setEditPayload] = useState<any>();
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const { setDetailData } = useOfferGroupHook();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showFeature, setShowFeature] = useState<boolean>(false);

  const handleEditClick = (row: OfferGroupNode) => {
    setEditingRowId(row.index);
  };

  const { setDetailModalData, detailModalData } =
    useSubscriptionPlanOfferListContext();

  const [offerGroup, setOfferGroup] = useState<OfferGroupData[]>([]);
  // const [expandedRow, setExpandedRow] = useState<String | null>(null);

  const fetchParent = async (data: any): Promise<OfferGroupNode[]> => {
    // console.log(data, "di parent");

    try {
      // console.log("test", selectedVer);

      if (!selectedVer) return [];

      const param = {
        // indepProdSpecId: data.indepProdSpecId,
        offerVerId: selectedVer?.offerVerId ?? 0,
        spId: 0,
      };

      // console.log(param);

      const response = await GetData(
        `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-offer-select`,
        param,
      );

      const responseData = response.data;
      if (!response.status) setIsLoading(false);

      // toast.success(response.message ?? "Success to fetch data");

      return responseData;
    } catch (error) {
      //  console.log(error);

      return [];
    }

    // return [];
  };

  const handleShowAddDialog = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
  }, []);

  const handleShowPublicOfferGroup = useCallback((open: boolean) => {
    setIsPublicOfferGroupOpen(open);
  }, []);

  const handleShowSelectOfferGroup = useCallback((open: boolean) => {
    setIsSelectDialogOpen(open);
  }, []);

  const handleShowDealOfferGroup = useCallback((open: boolean) => {
    setIsDealDialogOpen(open);
  }, []);

  const handleDetailOfferGroupModal = (group: any) => {
    setSelectedGroup(group);
    setIsDetailOfferGroupOpen(true);
  };

  const suggestions = useMemo(() => {
    if (!search) return [];
    return partys.filter((p) => p.offerGroupName);
  }, [search, partys]);

  const handleSelect = (row: OfferGroupNode) => {
    setSearch(row.offerGroupName ?? "");
    setShowSuggestions(false);
    setSelectedDir(row);
    handleExpand(row);
    // console.log(row);
  };

  const initializeData = async () => {
    setIsLoading(true);
    // setEditingRowId(null)
    expanded.clear();
    const data: OfferGroupNode[] = await fetchParent(rowData);
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

  useEffect(() => {
    // console.log(rowData, "ini", selectedSubSubPlan);

    if (!isDealDialogOpen) initializeData();
    // console.log("dimasukin ke row>", rowData);
  }, [selectedVer, isDealDialogOpen, isSelectDialogOpen]);

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
          isChild: true,
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
        `${API_URL_OFFER}/offer/group/qry-offer-group-mem-list`,
        param,
      );

      const responseData = response.data;

      return responseData;
    } catch (error) {
      return [];
    }

    return [];
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
        setPartys((prev) => removeChildrenRecursively(prev, row.index));
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
          let temp: OfferGroupNode[] = [];
          if (!row.child) temp = await fetchChild(row.index, row.level ?? 0);
          else temp = row?.child;
          // row.child = [...temp]

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
    const data = {
      offerVerId: row.offerVerId,
      offerGroupId: row.offerGroupId,
      necessary: row.necessary,
      spId: 0,
      seq: row.seq,
    };

    setEditPayload(data);
    setShowConfirm(true);
  };

  const onEdit = async () => {
    try {
      const resp = await PutData(
        `${API_URL_OFFER}/offer/subs-plan/mod-subs-plan-offer-select`,
        editPayload,
      );

      if (!resp?.status) toast.error(resp?.message);
      else toast.success("Success editing data");
    } catch (error) {
      toast.error("Failed to edit data");
    } finally {
      setShowConfirm(false);
      setEditingRowId(null);
      setEditPayload(null);
    }
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
                onClick={() => handleExpand(data)}
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
        accessorFn: (row) => row.groupType,
        id: "groupType",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Group Mode"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original.groupType;
          const base = data === "B" ? "Single Select" : "Multi Select";
          const handleToggle = (val: string) => {
            row.original.groupType = val === "B" ? "B" : "C";
          };
          const isDisable = editingRowId !== row.original.index;
          if (!data) return;
          if (true) return <div>{base}</div>;
          else
            return (
              <div className="flex items-center justify-center">
                <Select
                  // value={formField.status}
                  onValueChange={(status) => handleToggle(status)}
                  disabled={isDisable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={base} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">Single Select</SelectItem>
                    <SelectItem value="C">Multi Select</SelectItem>
                    <SelectItem value="A">Select All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
        },
      },
      {
        accessorFn: (row) => row.necessary,
        id: "necessary",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Is Necesarry"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original.necessary;
          const bool = data === "1";
          const handleToggle = () => {
            row.original.necessary = bool ? "0" : "1";
          };
          const isDisable = editingRowId !== row.original.index;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                // checked={bool}
                defaultChecked={bool}
                onChange={handleToggle}
                disabled={isDisable}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
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
            row.original.defaultFlag = bool ? "N" : "Y";
          };
          const isDisable = editingRowId !== row.original.index;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                // checked={bool}
                defaultChecked={bool}
                onChange={handleToggle}
                disabled={true}
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
        cell: ({ row }) =>
          row.original.csrVisible === "Y" ? <KeenIcon icon="eye" /> : null,
      },
      {
        accessorFn: (row) => row.offerEffDate,
        id: "offerEffDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Agreement Period"
            column={column}
          />
        ),
        cell({ row }) {
          const periodStr = !row.original.agreementPeriod
            ? null
            : row.original.agreementPeriod?.toString();
          const timeUnitSts = !row.original.timeUnit
            ? ""
            : timeUnit[row.original.timeUnit];
          const effTypeStr = !row.original.agreementEffType
            ? ""
            : agreementEffType[row.original.agreementEffType ?? "1"];

          const str = !row.original.agreementPeriod
            ? ""
            : `${periodStr} ${timeUnitSts}/${effTypeStr} `;
          return <div>{str}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.feature,
        id: "feature",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Feature" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          if (!row.original.isChild) return;
          return (
            <div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedMem(row.original);
                  setShowFeature(true);
                }}
              >
                Feature
              </Button>
            </div>
          );
        },
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
          if (row.original.isChild) return;
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
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  handleEditClick(row.original);
                }}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                //  onClick={() => handleDeleteDialog(feature.offerGroupId, feature.attrId)}
                onClick={() => handleDelete(row.original)}
                title="Delete"
              >
                <KeenIcon icon="trash" />
              </button>
              </AccessWrapper>
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

  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [deleteNode, setDeleteNode] = useState<OfferGroupNode>();

  const handleDelete = (item: OfferGroupNode) => {
    setDeleteNode(item);
    setShowDelete(true);
  };

  const onDelete = async () => {
    try {
      if (!deleteNode) {
        //  console.log(deleteNode);
        return;
      }

      //  console.log(selectedVer, deleteNode);

      const resp = await DeleteData(
        `${API_URL_OFFER}/offer/subs-plan/del-subs-plan-offer-select/${selectedVer?.offerVerId ?? 0}/${deleteNode?.offerGroupId}`,
        {},
      );

      if (!resp?.status) toast.error(resp?.message);
      else {
        setPartys((prev) =>
          prev.filter((item) => item.offerGroupId !== deleteNode.offerGroupId),
        );
        toast.success("Success delete data");
      }
    } catch (error) {
      toast.error("Failed to edit data");
    } finally {
      setShowDelete(false);
      setDeleteNode(undefined);
    }
  };

  const OfferGroupToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-start item-center p-4">
      <div className="flex gap-3">
        {/* <DefaultTooltip title="Add Group" placement="top"> */}
        <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="Add Group">
          <Button
            variant="default"
            className="h-7.5"
            onClick={() => handleShowAddDialog(true)}
            disabled={!selectedVer}
          >
            Add Group
          </Button>
              </AccessWrapper>
        {/* </DefaultTooltip> */}

        <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="Select Offer Group">
          <Button
            variant="outline"
            className="h-7.5"
            onClick={() => handleShowSelectOfferGroup(true)}
            disabled={!selectedVer}
          >
            <KeenIcon icon="copy" />
            Select Offer Group
          </Button>
        </AccessWrapper>

        <DefaultTooltip title="Public Offer Group" placement="top">
          <Button
            variant="outline"
            className="h-7.5"
            onClick={() => handleShowPublicOfferGroup(true)}
          >
            <KeenIcon icon="plus" />
            Public Offer Group
          </Button>
        </DefaultTooltip>

        <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
        <ButtonCursor
          title="Deal Offer Group"
          variant="outline"
          onClick={() => handleShowDealOfferGroup(true)}
          className="h-7.5"
          disable={!selectedGroup || !selectedVer || partys.length === 0}
        >
          <KeenIcon icon="plus" />
          Deal Offer Group
        </ButtonCursor>
        </AccessWrapper>

        <DefaultTooltip title="Refresh Data">
          <Button
            className="h-7.5"
            variant="outline"
            onClick={initializeData}
            disabled={!selectedVer}
          >
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <AddPrivateOfferGroupSubsPlan
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        group={selectedGroup}
      />

      <DealOfferGroupSubsPlan
        isOpen={isDealDialogOpen}
        onClose={() => setIsDealDialogOpen(false)}
        group={selectedGroup}
      />

      <DetailOfferGroupDialog
        isOpen={isDetailOfferGroupOpen}
        onClose={() => setIsDetailOfferGroupOpen(false)}
        group={selectedGroup}
      />

      <SelectOfferGroupSubsPlan
        isOpen={isSelectDialogOpen}
        onClose={() => setIsSelectDialogOpen(false)}
      />

      <PublicOfferGroup
        isOpen={isPublicOfferGroupOpen}
        onClose={() => setIsPublicOfferGroupOpen(false)}
        rowData={detailModalData}
        group={selectedGroup}
      />

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
        onConfirm={onDelete}
        bgOn={false}
        // asdasd
      />

      <FeatureOfferGroupContent
        isOpen={showFeature}
        handleDialog={setShowFeature}
        payload={{
          offerId: selectedSubSubPlan.indepProdSpecId,
          subsPlanVerId: selectedVer?.offerVerId,
          offerName: selectedMem?.offerName,
        }}
      />

      {/* Data Grid Offer Group */}
      <div className="relative">
        {isLoading && <Loading />}
        <DataGridProvider
          key={`datagrid-${partys.length}`}
          columns={column}
          pagination={{ size: partys.length }}
          data={partys}
          toolbar={<OfferGroupToolbar />}
          // getSubRows={(row) => row.subRow ?? []}
          layout={{ card: true }}
          // sorting={[{ id: "featureName", desc: false }]}
          getRowProps={(row) => ({
            className:
              row.original.index === selectedDir?.index
                ? selectedRowHighLight
                : nonSelectedRowHighLight,
            onClick: () => handleExpand(row.original),
          })}
          serverSide={false}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetDirectoryPortalData(pageIndex + 1, pageSize);
          }}
        >
          <div className="border-[1px] rounded-lg ">
            <OfferGroupToolbar />
            <div className="overflow-y-auto">
              <DataGridTable />
            </div>
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};

export default OfferGroupContentSubsPlanNode;
