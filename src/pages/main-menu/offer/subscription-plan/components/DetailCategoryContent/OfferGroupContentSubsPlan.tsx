import React, { useCallback, useState, useMemo, useEffect } from "react";
import PublicOfferGroup from "./PublicOfferGroupSubsPlan";
import { useSubscriptionPlanOfferListContext } from "../../hooks/useSubscriptionPlanOfferListContext";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import AddPrivateOfferGroupSubsPlan from "../../blocks/AddPrivateOfferGroupSubsPlan";
import SelectOfferGroupSubsPlan from "../../blocks/SelectOfferGroupSubsPlan";
import DealOfferGroupSubsPlan from "../../blocks/DealOfferGroupSubsPlan";
import DetailOfferGroupDialog from "../../blocks/DetailOfferGroupDialog";
import { Button } from "@/components/ui/button";

interface OfferGroupContentSubsPlanProps {
  rowData: any;
}

export interface OfferGroupData {
  groupName: string;
  groupMode: string;
  isNe: string;
  defaultValue: string;
  csrVisible: string;
  agreementPeriod: string;
  feature: string;
}

export interface OfferGroupDataNew {
  offerGroupId: number;
  offerGroupName: string;
  offerGroupCode: string;
  offerGroupType: string;
  groupType: string;
  upperLimit: number;
  lowerLimit: number;
  effDate: string;
  expDate: string;
  createdDate: string;
  state: string;
  stateDate: string;
  shareFlag: string;
  indepProdSpecId: number;
  comments: string;
  spId: number;
  offerVerId: number;
  networkType: string;
}

type DialogType = "add" | string | null;

const API_URL_OFFER = apiConfigOffer.offer;

const OfferGroupContentSubsPlan: React.FC<OfferGroupContentSubsPlanProps> = ({
  rowData,
}) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [isPublicOfferGroupOpen, setIsPublicOfferGroupOpen] = useState(false);
  const { GetData } = useCallApi();
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [isDetailOfferGroupOpen, setIsDetailOfferGroupOpen] = useState(false);

  const { setDetailModalData, detailModalData } =
    useSubscriptionPlanOfferListContext();

  const [offerGroup, setOfferGroup] = useState<OfferGroupData[]>([]);
  // const [expandedRow, setExpandedRow] = useState<String | null>(null);

  const dummyData = [
    {
      name: "SC Development for Prepaid",
      id: 4,
      mode: "Single-Select",
      isNecessary: "Y",
      defaultValue: "Prepaid(0)",
      csrVisible: "",
      agreementPeriod: "",
      feature: "Feature",
      subRow: [
        {
          id: "1-1",
          name: "Development for prepaid",
          mode: "",
          isNecessary: "Y",
          defaultValue: "-",
          csrVisible: "Y",
          agreementPeriod: "-",
          feature: "Feature",
          subRow: [],
        },
      ],
    },
    {
      name: "Prepaid Dedicated Price Plan",
      id: 5,
      mode: "Multi-Select",
      isNecessary: "N",
      defaultValue: "Postpaid(1)",
      csrVisible: "",
      agreementPeriod: "",
      feature: "Feature",
      subRow: [],
    },
  ];

  // useEffect(() => {
  // //  console.log("INI DATANYA", rowData);
  // }, [rowData]);

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

  // const handleInputChange = (field: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  // };

  // Data Grid Columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "detail",
        header: () => null,
        cell: ({ row }) => {
          const group = row.original;
          // console.log("HHHHHHHHHHH", group);
          return (
            <button
              onClick={() => handleDetailOfferGroupModal(group)}
              title="Detail Offer Group"
            >
              <KeenIcon icon="plus" />
            </button>
          );
        },
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Offer Group Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.mode,
        id: "mode",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Group Mode"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        // cell: ({ row }) => (row.original.csrVisible === "Y" ? <KeenIcon icon="eye" /> : null),
      },
      {
        accessorFn: (row) => row.isNecessary,
        id: "isNecessary",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Is Necesarry"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.isNecessary === "Y" ? <KeenIcon icon="check" /> : "-",
      },
      {
        accessorFn: (row) => row.defaultValue,
        id: "defaultValue",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Default Value"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.csrVisible,
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
        accessorFn: (row) => row.agreementPeriod,
        id: "agreementPeriod",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Agreement Period"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.feature,
        id: "feature",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Feature" column={column} />
        ),
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
          // const feature = row.original;

          // if (editingRowId === feature.attrId) {
          //   return (
          //     <div className="flex gap-2 justify-center">
          //       <button className="btn btn-sm btn-success bg-blue-500 hover:bg-blue-400" onClick={() => handleSaveEdit(feature)}>
          //         Save
          //       </button>
          //       <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
          //         Cancel
          //       </button>
          //     </div>
          //   );
          // }

          return (
            <div className="flex items-center justify-center gap-2">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                // onClick={() => {
                //   handleEditClick(row.original);
                // }}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                //  onClick={() => handleDeleteDialog(feature.offerId, feature.attrId)}
                title="Delete"
              >
                <KeenIcon icon="trash" />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [],
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      if (!rowData?.offerId && !rowData?.id) {
        console.warn("❗ No offerId or id provided in rowData");
        return { data: [], totalCount: 0 };
      }

      const offerId = rowData.offerId || rowData.id;

      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/attr/qry-offer-attr-by-offer-id`,
          {
            offerIds: offerId,
          },
        );

        const result = response?.data ?? [];
        setOfferGroup(result); // optionally store to state if still needed elsewhere

        // Apply client-side filtering and sorting
        let processedData = [...result];

        // Optional: Apply sorting
        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof OfferGroupData];
            const bValue = b[id as keyof OfferGroupData];

            if (typeof aValue === "string" && typeof bValue === "string") {
              return desc
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue);
            }

            if (aValue < bValue) return desc ? 1 : -1;
            if (aValue > bValue) return desc ? -1 : 1;
            return 0;
          });
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = processedData.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          totalCount: processedData.length,
        };
      } catch (error) {
        toast.error("❌ Failed to fetch feature data");
        return { data: [], totalCount: 0 };
      }
    },
    [rowData],
  );

  const OfferGroupToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-start item-center p-4">
      <div className="flex gap-3">
        <DefaultTooltip title="Add Group" placement="top">
          <Button
            variant="default"
            className="h-7.5"
            onClick={() => handleShowAddDialog(true)}
          >
            Add Group
          </Button>
        </DefaultTooltip>

        <DefaultTooltip title="Select Offer Group" placement="top">
          <Button
            variant="outline"
            className="h-7.5"
            onClick={() => handleShowSelectOfferGroup(true)}
          >
            <KeenIcon icon="copy" />
            Select Offer Group
          </Button>
        </DefaultTooltip>

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

        <DefaultTooltip title="Deal Offer Group" placement="top">
          <Button
            variant="outline"
            className="h-7.5"
            onClick={() => handleShowPublicOfferGroup(true)}
          >
            <KeenIcon icon="plus" />
            Deal Offer Group
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

      <DealOfferGroupSubsPlan
        isOpen={isDealDialogOpen}
        onClose={() => setIsDealDialogOpen(false)}
      />

      <PublicOfferGroup
        isOpen={isPublicOfferGroupOpen}
        onClose={() => setIsPublicOfferGroupOpen(false)}
        rowData={detailModalData}
      />

      {/* Data Grid Offer Group */}
      <div className="">
        <DataGridProvider
          // key={reloadKey}
          columns={columns}
          pagination={{ size: 10 }}
          data={dummyData}
          toolbar={<OfferGroupToolbar />}
          // getSubRows={(row) => row.subRow ?? []}
          layout={{ card: true }}
          sorting={[{ id: "featureName", desc: false }]}
          serverSide={false}
          // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          //   return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
          // }}
        />
      </div>
    </div>
  );
};

export default OfferGroupContentSubsPlan;
