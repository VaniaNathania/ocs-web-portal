// AdvancedRulesList.tsx - Updated version with proper refresh function

import {
  ContentLoader,
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
  DataGridColumnHeader,
  DataGridProvider,
  DataGridInner,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DeleteTriggerTypeKey, useTriggerCreateContext } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";

import moment from "moment";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import DeleteDialog from "../DeleteDialog";
// import { AddAdvanceRuleDialog } from "../AddAdvanceRuleTrigger";
import { AdvancedRulesListToolBar } from "./AdvancedRulesListToolBar";
import AdvancedRulesComponent from "./AddAdvancedRulesList";
import EditAdvancedRules from "./EditAdvancedRules";
import DeleteAdvancedRulesDialog from "./DeleteAdvancedRules";
import BwfDialog from "./bwf/AddBWFDialog";
import { set } from "date-fns";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

const API_URL = apiConfig.service_price_plan;

const AdvancedRulesList = () => {
  const { GetData } = useCallApi();
  const {  selectedOfferVerId  } = usePortalData();
  const [loading, setLoading] = useState(false);
  const [sortOperatorList, setSortOperatorList] = useState([]);
  const [functionList, setFunctionList] = useState([]);
  const [ratableEventList, setRatableEventList] = useState([]);
  // Add local refresh key state
  const [advancedInfo, setAdvancedInfo] = useState<AdvancedInfo>({
    seq: null,
    triggerId: null,
  });
  const {
    handleEditAdvancedRulesDialog,
    handleShowBWFDialog,
    handleDeleteAdvancedRulesDialog,
    refreshAdvancedList,
    refreshKeyAdvanced,
    setRefreshKeyAdvanced,
  } = useTriggerCreateContext();
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.seq,
        id: "seq",
        header: ({ column }) => (
          <DataGridColumnHeader title="Seq" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },

        cell: ({ row: { original: row } }) => {
          return <>{row.seq || "-"}</>;
        },
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Effective Date " column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          return (
            <>
              {moment(row.effDate).format("DD-MM-YYYY") || "-"}
              <br />
            </>
          );
        },
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Expiry Date " column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row: { original: row } }) => {
          const formattedDate = row.expDate
            ? moment(row.expDate).format("DD-MM-YYYY")
            : "-";
          return <div>{formattedDate}</div>;
        },
      },
      {
        id: "triggerId",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <div className="flex justify-center">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  handleEditAdvancedRulesDialog(true, row);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setAdvancedInfo({
                    seq: row.seq,
                    triggerId: row.triggerId,
                  });
                  handleShowBWFDialog(true, row);
                }}
              >
                <KeenIcon icon="eye" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  handleDeleteAdvancedRulesDialog(true, row);
                }}
              >
                <KeenIcon icon="trash" />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "w-1/12 text-center",
        },
      },
    ],
    [],
  );

  const doGetListAdvancedRules = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => {
    sorting = sorting.length === 0 ? [{ id: "", desc: false }] : sorting;

    filter = filter?.length === 0 ? {} : filter;
    let filterObject: Record<string, string | string[]> = {};
    if (Object.keys(filter).length !== 0) {
      for (let _filter of filter) {
        filterObject[_filter.id] = _filter.value;
      }
    }

    filter = filterObject;

    const response = await GetData(
      `${API_URL}/trigger/advance-rule/list/${selectedOfferVerId}`,
      {
        id: selectedOfferVerId,
        order_field: sorting[0].id,
        order_direction: sorting[0].desc === false ? "ASC" : "DESC",
      },
    );

    return {
      data: response?.data,
      totalCount: response?.totalRows,
    };
  };

  // const refreshAdvancedList = useCallback(() => {
  //   setRefreshKey((prev) => prev + 1);
  // }, []);

  // useEffect(() => {
  //   refreshAdvancedList();
  // }, [refreshAdvancedList]);

  useEffect(() => {
    refreshAdvancedList();
  }, [selectedOfferVerId]);

  return (
    <>
      <DataGridProvider
        key={`${refreshKeyAdvanced}`}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<AdvancedRulesListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: "effDate", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListAdvancedRules(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>

        {/* Pass the refresh function to AdvancedRulesComponent */}
        <AdvancedRulesComponent refreshData={refreshAdvancedList} />
        <EditAdvancedRules onRefresh={refreshAdvancedList} />
        <DeleteAdvancedRulesDialog onRefresh={refreshAdvancedList} />
        <BwfDialog
          onRefresh={refreshAdvancedList}
          advancedInfo={advancedInfo}
        />
      </DataGridProvider>
    </>
  );
};

export { AdvancedRulesList };
