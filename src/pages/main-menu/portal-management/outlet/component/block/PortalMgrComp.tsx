import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { usePortalLayout } from "@/layouts/main-menu/portal-management";
import { useCompList } from "../hook/useComp";
import {
  PopUpDialog,
  PopUpProps,
} from "@/pages/main-menu/role-management/generalUseComp";
import { Party } from "../hook/CompProvider";
import { apiConfigRole } from "@/config/api.config";

interface NodeMap {
  [key: number]: NodeMap;
}

const API_URL = apiConfigRole.role;

export const PortalManagementComp = () => {
  //   const [selectedDir, setSelectedDir] = useState<Party>();
  const { setDesc, setOnConfirm, setShowConfirm } = useCompList();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<Party[]>([]); // Full flattened list
  const [searchPartys, setSearchPartys] = useState<Party[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const { GetData, PutData, DeleteData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { menuPrivAccess, selectedRow, selectedDir, setSelectedDir, allDir } =
    usePortalLayout();
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [alert, setAlert] = useState<boolean>(false);
  const [changePos, setChangePos] = useState<boolean>(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const isExpandingRef = useRef(false);

  const [dialogProps, setDialogProps] = useState<PopUpProps>({
    isOpen: alert,
    handleDialog: () => {
      setAlert(false);
    },
    type: "alert",
    desc: "",
    title: "Error",
  });

  // useEffect(() => {
  // //  console.log(allDir);
  // }, [allDir]);

  const baseDir: Party = {
    type: "0",
    parentId: -1,
    partyName: `Root of Directory of `,
    level: 0,
    seq: 0,
    portalId: 0,
    partyId: 0,
    index: "0",
    parentIndex: "-1-0-0",
  };

  // Filter suggestions from partys.privName
  const suggestions = useMemo(() => {
    if (!search) return [];
    if (!expanded.has("0")) return [];
    return searchPartys.filter((p) =>
      p.partyName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, searchPartys, expanded]);
  const scrollToRow = useCallback((rowId: string) => {
    setTimeout(() => {
      const rowElement = rowRefs.current.get(rowId);
      const container = tableContainerRef.current;

      if (rowElement && container) {
        const containerRect = container.getBoundingClientRect();
        const rowRect = rowElement.getBoundingClientRect();

        const isAboveView = rowRect.top < containerRect.top;
        const isBelowView = rowRect.bottom > containerRect.bottom;

        if (isAboveView || isBelowView) {
          const scrollTop =
            rowElement.offsetTop -
            container.offsetTop -
            container.clientHeight / 2 +
            rowElement.clientHeight / 2;

          container.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }

        rowElement.classList.add("highlight-animation");
        setTimeout(() => {
          rowElement.classList.remove("highlight-animation");
        }, 1000);
      }
    }, 100);
  }, []);

  const getPathToNode = (data: Party[], targetId: string | number): Party[] => {
    const path: Party[] = [];

    let current = data.find((x) => x.partyId === targetId);

    while (current) {
      path.unshift(current);
      current = current.parentId
        ? data.find((x) => x.partyId === current!.parentId)
        : baseDir;
    }

    return path;
  };

  const expandPath = async (path: Party[]) => {
    //  console.log(path);

    if (path[0].parentId != -1) return;
    for (let i = 0; i < path.length; i++) {
      const node = { ...path[i], level: i };

      // if (!node) continue;
      // skip leaf nodes
      if (i === path.length - 1) scrollToRow(path[i].index ?? "");
      const isAlreadyExpanded = expanded.has(node.index ?? "");
      // console.log(node.partyName, isAlreadyExpanded);

      if (!isAlreadyExpanded) {
        await handleExpand(node); // your existing code
      }
    }
  };

  const handleSelect = async (row: Party) => {
    setSearch(row.partyName ?? "");
    setShowSuggestions(false);
    setSelectedDir(row);

    // NEW: Expand parent directories if needed

    const path = await getPathToNode(searchPartys, row.partyId);

    await expandPath(path);

    // NEW: If the selected item is a directory, expand it too
    // if (row.type === "0" && !expanded.has(row.id)) {
    //   await handleExpand(row);
    // }

    // NEW: Scroll to the selected row
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToRow(row.index ?? "");
        setSelectedDir(row);
      });
    });
  };

  const buildNestedMap = async (items: Party[]) => {
    const childrenMap: NodeMap = {};
    const tempSearch: Party[] = [];

    // Prepare container for every id
    items.forEach((item) => {
      childrenMap[item.partyId] = {};
    });

    const result: NodeMap = {};

    // console.log(items, allDir);

    items.forEach((item) => {
      const data = allDir.find((dir) => dir.id === item.partyId);
      if (data) {
        tempSearch.push({
          ...item,
          parentId: data.parentId,
          index: `${data.parentId ?? 0}-${item.seq}-${item.partyId}`,
        });

        if (data.parentId) {
          // Place this data under its parent
          if (!childrenMap[data.parentId]) {
            childrenMap[data.parentId] = {};
          }
          childrenMap[data.parentId][data.id] = childrenMap[data.id];
        } else {
          // Root-level (no parent)
          result[data.id] = childrenMap[data.id];
        }
      }
    });

    // console.log(tempSearch);

    setSearchPartys(tempSearch);

    return result;
  };

  const fetchChildNodes = async (
    portalId: number,
    parentId: number,
    level: number = 1,
    index: string,
  ): Promise<Party[]> => {
    try {
      // console.log(`Fetching children for parentId: ${parentId}`);
      const res = await GetData(
        `${API_URL}/api/portals/${portalId}/party/${parentId > 0 ? parentId : 0}/dirs`,
        {},
      );

      const menuRes = await GetData(
        `${API_URL}/api/portals/portals/${portalId}/party/${parentId > 0 ? parentId : 0}/menus`,
        {},
      );
      if (!menuRes?.status || !menuRes?.data) {
        throw new Error(menuRes?.message || "Failed to fetch portal data");
      }
      if (!res?.status || !res?.data) {
        throw new Error(res?.message || "Failed to fetch portal data");
      }
      const childMenu: Party[] = menuRes.data.map((row: any) => ({
        ...row,
        isChild: true,
        partyName: row.privName,
        parentId,
        level: level + 1,
        index: `${parentId}-${row.seq}-${row.partyId}`,
        parentIndex: index,
      }));
      if (parentId === 0) {
        const temp = await buildNestedMap(res.data);
        // console.log(temp);
        const children: Party[] = res.data
          .filter((row: Party) => temp[row.partyId]) // keep only valid rows
          .map((row: Party) => ({
            ...row,
            isChild: true,
            parentId,
            level: level + 1,
            index: `${parentId}-${row.seq}-${row.partyId}`,
            parentIndex: index,
          }));

        const tempChild: Party[] = [...childMenu, ...children].sort(
          (a, b) => a.seq - b.seq,
        );

        // console.log(`Fetched ${children.length} children for ${parentId}`);
        //  console.log(tempChild);

        return tempChild;
      } else {
        const children = res.data.map((row: Party) => ({
          ...row,
          isChild: true,
          parentId,
          level: level + 1,
          index: `${parentId}-${row.seq}-${row.partyId}`,
          parentIndex: index,
        }));

        const tempChild: Party[] = [...childMenu, ...children].sort(
          (a, b) => a.seq - b.seq,
        );
        // console.log(`Fetched ${children.length} children for ${parentId}`);
        //  console.log(tempChild);

        return tempChild;
      }
    } catch (error: any) {
      console.error("Error fetching child nodes:", error.message);
      throw error;
    }
  };

  const initializeData = async () => {
    setIsLoading(true);

    // Reset expanded ALWAYS
    setExpanded(new Set()); // <--- IMPORTANT

    const tempBaseDir: Party = {
      ...baseDir,
      partyName: baseDir.partyName + selectedRow?.portalName,
      portalId: selectedRow?.portalId ?? 0,
    };

    try {
      // Reset partys list
      setPartys([tempBaseDir]);

      // Set selected
      setSelectedDir(tempBaseDir);
      removeChildrenRecursively([tempBaseDir], "0");

      // Expand AFTER state is applied (handled below)
      hasFetched.current = true;
    } catch (error) {
      toast.error("Failed on initializing data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // console.log(selectedRow, "ini di portalmgr");
    initializeData();
  }, [selectedRow]);

  // Fixed removeChildrenRecursively function
  function removeChildrenRecursively(
    data: Party[],
    parentIndex: string,
  ): Party[] {
    // Create a map of partyId to item for quick lookup
    const childrenToRemove = new Set<string>();
    const childIds = new Set<string>();
    //  console.log(expanded, parentIndex);

    data.forEach((item) => {
      if (item.parentIndex === parentIndex) {
        // console.log(item.index, item.partyName, item.parentIndex, "if");
        // console.log(item.partyName, item.partyId);

        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(item.index ?? "");
          return copy;
        });

        childrenToRemove.add(item.index ?? "0");
        childIds.add(item.index ?? "");
      } else if (childIds.has(item.parentIndex ?? "")) {
        // console.log(item.index, item.partyName, item.parentIndex, "else");

        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(item.index ?? "");
          return copy;
        });
        childrenToRemove.add(item.index ?? "0");
        childIds.add(item.index ?? "");
      }
    });
    return data.filter((item) => !childrenToRemove.has(item.index ?? "0"));
  }

  // const refreshNodeChild = ()

  const handleExpand = async (row: Party) => {
    if (isExpandingRef.current) return; // hard gate

    isExpandingRef.current = true;
    setIsExpanding(true);
    setSelectedDir(row);

    try {
      const isExpanded = expanded.has(row.index ?? "");
      // console.log(isExpanded, allDir);
      if (allDir.length === 0) return console.log(allDir);
      if (isExpanded) {
        setPartys((prev) => removeChildrenRecursively(prev, row.index ?? ""));
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(row.index ?? "");
          return copy;
        });
      } else {
        let children: Party[] = [];
        if (row.type === "0") {
          // setAvailableComponents([]);
          const temp = await fetchChildNodes(
            row.portalId,
            row.partyId,
            row.level,
            row.index ?? "",
          );

          children = temp.sort((a, b) => a.seq - b.seq);
          setExpanded((prev) => new Set(prev).add(row.index ?? ""));
        }
        setPartys((prev) => {
          const index = prev.findIndex((p) => p.partyId === row.partyId);
          const updated = [...prev];
          updated.splice(index + 1, 0, ...children);
          return updated;
        });
      }
    } catch (error) {
      toast.error("Failed to expand directory");
    } finally {
      setIsExpanding(false);
      isExpandingRef.current = false;
    }
  };

  const handleCloseParent = async (parentId: number, close: boolean) => {
    setIsLoading(true);
    try {
      const parent = partys.find((item) => item.partyId === parentId);
      if (parent) {
        //  console.log(expanded.has(parent.index ?? "///"));

        if (close && expanded.has(parent.index ?? "///")) {
          return handleExpand(parent);
        }
        const child: Party[] = await fetchChildNodes(
          parent.partyId,
          parent.parentId ?? 0,
          parent.level ?? 0,
          parent.index ?? "",
        );

        const edited = child.find((item) => item.partyId === editValues.id);

        setPartys((prev) => {
          return prev.map((item) => {
            if (item.partyId === edited?.partyId) return edited;
            return item;
          });
        });
      }
      return;
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleChangePosition = async (change: "up" | "down", row: Party) => {
    setSelectedDir(row);
    setChangePos(true);

    const siblings = partys.filter((item) => item.parentId === row.parentId);
    const rowIndex = siblings.indexOf(row);
    const mainIndex = partys.indexOf(row);

    handleCloseParent(row.partyId, true);
    try {
      let payload;

      let changeSibs: Party;

      if (change === "up") {
        if (rowIndex === 0) {
          return toast.error("Already at top position");
        }

        changeSibs = siblings[rowIndex - 1];
        handleCloseParent(changeSibs.partyId, true);

        payload = [
          { seq: changeSibs.seq, partyId: row.partyId, oldSeq: row.seq },
          { seq: row.seq, partyId: changeSibs.partyId, oldSeq: changeSibs.seq },
        ];
      } else {
        if (rowIndex === siblings.length - 1) {
          return toast.error("Already at bottom position");
        }

        changeSibs = siblings[rowIndex + 1];
        handleCloseParent(changeSibs.partyId, true);

        payload = [
          { seq: changeSibs.seq, partyId: row.partyId, oldSeq: row.seq },
          { seq: row.seq, partyId: changeSibs.partyId, oldSeq: changeSibs.seq },
        ];
      }

      const resp = await PutData(
        `${API_URL}/api/portals/mod-seq/${row.portalId}`,
        payload,
      );

      if (resp?.status) {
        setPartys((prev) => {
          const isUp = change === "up";
          const sibsIndex = prev.indexOf(changeSibs);
          const before = prev.slice(0, isUp ? sibsIndex : mainIndex);
          const after = prev.slice(
            isUp ? mainIndex + 1 : sibsIndex + 1,
            partys.length,
          );

          let temp;

          if (isUp) {
            temp = [
              ...before,
              {
                ...row,
                seq: changeSibs.seq,
              },
              { ...changeSibs, seq: row.seq },
              ...after,
            ];
          } else {
            temp = [
              ...before,
              { ...changeSibs, seq: row.seq },
              {
                ...row,
                seq: changeSibs.seq,
              },
              ...after,
            ];
          }

          return temp;
        });
        toast.success(resp.message);
      } else toast.error(resp?.message);
    } catch (error) {
      toast.error("Failed to change position");
    } finally {
      setChangePos(false); // ONLY here
    }
  };

  const handleDelete = (data: Party) => {
    setDesc(`Deleting  ${data?.partyName}`);
    //  console.log(data);

    setSelectedDir(data);
    setShowConfirm(true);
    setOnConfirm(() => () => onDelete(data));
  };

  const onDelete = async (data: Party) => {
    //  console.log(`Deleting  ${data.partyId} ${data.partyName}`);
    try {
      const resp = await DeleteData(
        `${API_URL}/api/portals/del-dir-menu-from-portal/${data.partyId}/${data.seq}/${selectedRow?.portalId}`,
        {},
      );

      if (resp?.status) {
        return toast.success(resp.message);
      }
      return toast.error(resp?.message);
    } catch (error) {
      return toast.error("Error deleting data");
    } finally {
      setShowConfirm(false);
      // initializeData();
      handleCloseParent(data.parentId ?? 0, true);
    }
  };

  const AvailableColumn = useMemo<ColumnDef<Party>[]>(
    () => [
      {
        accessorFn: (row) => row.partyName,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal/Directory Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const data = row.original;
          const isEditing = editingRowId === data.partyId;
          const isExpand = expanded.has(row.original.index ?? "");
          const isDir = data.type === "0";

          if (isEditing) {
            return (
              <Input
                // className="border rounded px-2 py-1 w-full"
                value={editValues.partyName}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            );
          }

          return (
            <DefaultTooltip placement="top" title={data.partyName}>
              <div
                style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
                // className={
                //   selectedDir?item.partyId === dataitem.partyId
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
                {data.partyName}
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
        id: "actions",
        // size: 300,
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const isRowRoot = row.original.partyId === 0;
          if (isRowRoot) return;

          return (
            <div className="flex items-center justify-center gap-2">
              {/* MoveUp */}
              <AccessWrapper hasAccess={true} enabledText="MoveUp">
                <Button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  disabled={changePos}
                  onClick={() => handleChangePosition("up", row.original)}
                >
                  <KeenIcon icon="arrow-up" />
                </Button>
              </AccessWrapper>

              {/* MoveDown */}
              <AccessWrapper hasAccess={true} enabledText="MoveDown">
                <Button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => handleChangePosition("down", row.original)}
                  disabled={changePos}
                >
                  <KeenIcon icon="arrow-down" />
                </Button>
              </AccessWrapper>

              {/* Delete */}
              <AccessWrapper hasAccess={true} enabledText="Delete">
                <Button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  // disabled={isRowRoot}
                  onClick={() => handleDelete(row.original)}
                >
                  <KeenIcon icon="trash" />
                </Button>
              </AccessWrapper>
            </div>
          );
        },
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10 w-[140px]",
        },
      },
    ],
    [expanded, selectedDir?.partyId, editingRowId, partys, changePos, allDir],
  );

  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number) => {
      return {
        data: partys,
        totalCount: partys.length,
      };
    },
    [partys, search], // Proper dependencies
  );

  return (
    <div className="bg-white p-5 rounded-md shadow-md space-y-2">
      <PopUpDialog {...dialogProps} isOpen={alert} handleDialog={setAlert} />
      <div className="flex flex-col w-full relative">
        <label className="input input-sm w-full md:w-1/3 flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Portal/Directory Name.."
            className="w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // delay so click still works
            onFocus={() => search && setShowSuggestions(true)}
          />
        </label>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 w-full md:w-1/3 bg-white border rounded-md shadow-md z-20 max-h-40 overflow-auto">
            {suggestions.map((p, idx) => (
              <li
                key={idx}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={() => handleSelect(p)} // use onMouseDown so blur doesn’t hide it first
              >
                {p.partyName}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        {(isLoading || isExpanding) && <Loading />}
        <DataGridProvider
          // key={`available-features-grid-${search}-${partys}-${allDir}`}
          columns={AvailableColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={partys}
          onFetchData={({ pageIndex, pageSize }) => {
            return doGetDirectoryPortalData(pageIndex + 1, pageSize);
          }}
          getRowProps={(row) => ({
            ref: (el: HTMLTableRowElement) => {
              if (el) {
                rowRefs.current.set(row.original.index ?? "", el);
              } else {
                rowRefs.current.delete(row.original.index ?? "");
              }
            },
            className: `${
              row.original.index === selectedDir?.index
                ? selectedRowHighLight
                : nonSelectedRowHighLight
            }`,
            onClick: () => setSelectedDir(row.original),
          })}
        >
          <div
            ref={tableContainerRef}
            className="h-screen overflow-y-auto w-full border-2"
          >
            <DataGridTable />
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};
