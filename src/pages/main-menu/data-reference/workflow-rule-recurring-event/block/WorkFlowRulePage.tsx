import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { DetailWorkFlowList } from "../types/type";
import DialogWorkFlowRule from "./DialogWorkFlowRule";
import { useWorkRuleModuleContext } from "../hook/useWorkFlowRuleModuleContext";
import { useWorkFlowRuleApi } from "../apiList/useWorkFlowRuleApi";
import ToolBarWorkFlow from "./ToolBar";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const WorkFlowPage = () => {
  const {
    openDialog,
    handleDeleteDatas,
    reloads,
    menuPrivAccess
  } = useWorkRuleModuleContext();
  const { getDetailRecurringProc } = useWorkFlowRuleApi();
  // useEffect(() => {
  //   fetchDataSearch();
  // }, []);
  const columns: ColumnDef<DetailWorkFlowList>[] = [
    {
      accessorKey: "reName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Ratable Resource Name" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "preWorkflowName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Pre-Processing" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "workflowName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Recurring Processing" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "postWorkflowName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Post Processing" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataGridColumnHeader title="Operation" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>  
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => openDialog("update", item)}
            >
              <KeenIcon icon="notepad-edit" />
            </button>
            </AccessWrapper>
            <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => {
                if (item.reId) handleDeleteDatas(item.reId);
              }}
            >
              <KeenIcon icon="trash"></KeenIcon>
            </button>
            </AccessWrapper>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      {/* <div className="flex w-[50%] gap-3 items-center px-5 py-3">
        <div className="relative w-full">
          <label className="w-1/3 overflow-hidden input input-sm">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Search"
              value={placeHolder}
              onChange={(event) => {
                setPlaceHolder(event.target.value);
                setSearchValue(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setSearchValue(placeHolder);
                }
              }}
            />
            {placeHolder && (
              <button
                onClick={() => {
                  setPlaceHolder("");
                  setSearchValue("");
                }}
                className="ml-2"
              >
                <KeenIcon icon="cross" />
              </button>
            )}
          </label>
        </div>
      </div> */}
      <DataGridProvider
        key={reloads}
        columns={columns}
        layout={{ card: true }}
        pagination={{ size: 10 }}
        sorting={[{ id: "RE_ID", desc: false }]}
        // data={filterDataSearch}
        serverSide={true}
        toolbar={<ToolBarWorkFlow />}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          getDetailRecurringProc({
            page: pageIndex + 1,
            size: pageSize,
            sortBy: sorting?.[0]?.id,
            sortDirection: sorting?.[0].desc ? "DESC" : "ASC",
            spId: 0,
          })
        }
      ></DataGridProvider>
      <DialogWorkFlowRule />
    </div>
  );
};

export default WorkFlowPage;
