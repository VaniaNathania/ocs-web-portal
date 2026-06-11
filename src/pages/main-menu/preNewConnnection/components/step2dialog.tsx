import {
  DialogWrapper,
  ParentDialogProps,
} from "../../role-management/generalUseComp";
import { Input } from "@/components/ui/input";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { useEffect, useMemo } from "react";
import RenderNode from "../blocks/RenderNode";
import { ColumnDef } from "@tanstack/react-table";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { TreeNodeMain } from "../blocks/BuildTreeMain";
import useStep2Dialog from "../services/useStep2Dialog";
import { usePreNew } from "../hooks/context";
import { Loading } from "../../role-management/block/loadingBlock";

interface newParentDialogProps extends ParentDialogProps {
  onOk: (catgId: number, offerId: number, offerName: string) => void;
}

const PncStep2Dialog = ({
  isOpen,
  handleDialog,
  onOk,
}: newParentDialogProps) => {
  const { formattedPrice } = usePreNew();
  const {
    handleExpandOnly,
    expandedRows,
    handleItemMainClick,
    handleToggleExpandMain,
    handleOk,
    handleSelectItem,
    handleToggleExpand,
    treeDataSidebar,
    expandedSidebar,
    selectedId,
    flattenData,
    selectedItemMain,
    fetchQryOfferCatalog,
    fetchQrySubsPlanByOfferCatg,
    isSidebarLoading,
    isMainLoading,
    setSelectedItemMain,
    showSuggestions,
    setShowSuggestions,
    search,
    setSearch,
    searchResult,
    wrapperRef,
    wrapperRefMain,
    showSuggestionsMain,
    setShowSuggestionsMain,
    searchMain,
    setSearchMain,
    searchMainResult,
  } = useStep2Dialog({
    onOk,
  });

  useEffect(() => {
    if (isOpen) {
      fetchQryOfferCatalog();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedId) return;
    if (isOpen) {
      fetchQrySubsPlanByOfferCatg(selectedId, 0);
    }
  }, [selectedId, isOpen]);

  useEffect(() => {
    if (!selectedItemMain?.id) return;

    const rowElement = document.getElementById(
      `offer-row-${selectedItemMain.id}`,
    );

    if (rowElement) {
      rowElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedItemMain]);

  const columns = useMemo<ColumnDef<TreeNodeMain>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Offer Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const indent = (item.__level || 0) * 20;
          const isParent = item.__level === 0;
          const label = item.name;
          const isExpanded = expandedRows.includes(item.id!);

          return (
            <div
              className="flex items-center cursor-pointer"
              style={{ paddingLeft: indent }}
              onClick={() => {
                if (isParent) {
                  handleToggleExpandMain(item.id!);
                }
              }}
            >
              {isParent && <KeenIcon icon={isExpanded ? "down" : "right"} />}

              <span className="pl-2">{label}</span>
            </div>
          );
        },
      },
      {
        id: "salePrice",
        accessorFn: (row) => row.salePrice,
        header: ({ column }) => (
          <DataGridColumnHeader title="Sale Price" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const isChildren = item.__level === 1;

          if (isChildren) {
            return formattedPrice(item.salePrice);
          }
        },
      },
      {
        id: "rentPrice",
        accessorFn: (row) => (row.__level === 1 ? row.priority : ""),
        header: ({ column }) => (
          <DataGridColumnHeader title="Rent Price" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const isChildren = item.__level === 1;

          if (isChildren && item.rentListPrice !== null) {
            return formattedPrice(item.rentListPrice);
          }
        },
      },
      {
        id: "cycleQuantity",
        accessorFn: (row) => (row.__level === 1 ? row.cycleQuantity : ""),
        header: ({ column }) => (
          <DataGridColumnHeader title="Agreement Period" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "expiryDate",
        accessorFn: (row) => (row.__level === 1 ? row.expDate : ""),
        header: ({ column }) => (
          <DataGridColumnHeader title="Expiry Date" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [expandedRows, handleToggleExpandMain],
  );

  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={handleDialog}
      title="Offer Selector"
      size={{ width: "7xl" }}
    >
      <div className="flex flex-row gap-5 pt-5 text-sm">
        {isSidebarLoading || isMainLoading ? <Loading /> : null}
        {/* sidebar */}
        <div className="flex flex-col gap-2 border-r-2 pr-2">
          <div className="relative" ref={wrapperRef}>
            <div className="input input-sm bg-white">
              <Input
                className="border-none"
                placeholder="Search Offer Category Name"
                value={search ?? ""}
                onClick={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
              />
              <KeenIcon icon="magnifier" />
            </div>
            <div>
              {showSuggestions && (
                <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-50 max-h-40 overflow-auto">
                  {searchResult.length > 0 ? (
                    searchResult.map((item, index) => (
                      <li
                        key={`${item.id}-${index}`}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          if (!item.id) return;
                          handleSelectItem(item.id);
                          setShowSuggestions(false);
                          if (item.parentCatgId) {
                            handleExpandOnly(item.parentCatgId);
                          }
                        }}
                      >
                        <DefaultTooltip title={item.name} placement="top">
                          <div className="w-full truncate">{item.name}</div>
                        </DefaultTooltip>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-center">No record found..</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Input
              type="checkbox"
              size={"sm"}
              className="w-[15px] h-[15px] accent-primary"
            />
            All Category
          </div>
          {/* sidebar */}
          <div className="mt-5">
            {treeDataSidebar.length > 0 ? (
              treeDataSidebar.map((item) => (
                <RenderNode
                  key={item.nodeId}
                  node={item}
                  expanded={expandedSidebar}
                  onToggle={handleToggleExpand}
                  onSelect={handleSelectItem}
                  selectedId={selectedId ?? null}
                  setSelectedItemMain={setSelectedItemMain}
                />
              ))
            ) : (
              <span className="flex items-center text-gray-600 justify-center">
                No data available
              </span>
            )}
          </div>
        </div>
        {/* main */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="relative max-w-[368px]" ref={wrapperRefMain}>
            <div className="input input-sm bg-white ">
              <Input
                className="border-none"
                placeholder="Search Offer Name"
                value={searchMain}
                onClick={() => setShowSuggestionsMain(true)}
                onChange={(e) => {
                  setSearchMain(e.target.value);
                  setShowSuggestionsMain(true);
                }}
              />
              <KeenIcon icon="magnifier" />
            </div>
            <div>
              {showSuggestionsMain && (
                <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-50 max-h-40 overflow-auto">
                  {searchMainResult.length > 0 ? (
                    searchMainResult.map((item, index) => (
                      <li
                        key={`${item.id}-${index}`}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          if (!item.id) return;
                          handleItemMainClick(item);
                          setShowSuggestionsMain(false);
                        }}
                      >
                        <DefaultTooltip title={item.name} placement="top">
                          <div className="w-full truncate">{item.name}</div>
                        </DefaultTooltip>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-center">No record found..</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* grid */}
          <div className="h-[300px] overflow-auto">
            {/* {isMainLoading ? (
              <Loading />
            ) : ( */}
            <DataGridProvider
              data={flattenData}
              columns={columns}
              pagination={{ size: 100 }}
              layout={{ card: false }}
              sorting={[{ id: "", desc: false }]}
              serverSide={false}
              getRowProps={(row) => ({
                id: `offer-row-${row.original.id}`,
                className:
                  row.original.id === selectedItemMain?.id
                    ? selectedRowHighLight
                    : nonSelectedRowHighLight,
                onClick: () => {
                  const item = row.original;

                  if (item.__level === 1 && item.children?.length === 0) {
                    handleItemMainClick(row.original);
                  }
                },
              })}
            />
            {/* )} */}
          </div>
        </div>
      </div>
      {/* footer */}
      <DialogFooter className="flex justify-end mt-2">
        <Button className="hover:bg-blue-700" onClick={handleOk}>
          OK
        </Button>
      </DialogFooter>
    </DialogWrapper>
  );
};

export default PncStep2Dialog;
