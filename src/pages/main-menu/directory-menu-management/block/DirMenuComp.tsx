import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { useCompList } from "../hook/useComp";
import { toast } from "sonner";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";
import { Button } from "@/components/ui/button";
import { useDirMenuLayout } from "@/layouts/main-menu/directory-menu-management";
import { Input } from "@/components/ui/input";
import { apiConfigRole } from "@/config/api.config";
import IconSelector from "./IconSelector";
import { useForm } from "react-hook-form";
import { DirMenuManagementData } from "../hook/CompProvider";

const API_URL = apiConfigRole.role;

export const DirectoryMenuManagementComp = () => {
  //   const [selectedRow, setSelectedRow] = useState<DirMenuManagementData>();
  const {
    selectedRow,
    setSelectedRow,
    setShowConfirm,
    setOnConfirm,
    setDesc,
    showMenuSelector,
  } = useCompList();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<DirMenuManagementData[]>([]); // Full flattened list
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const { GetData, DeleteData, PutData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { menuPrivAccess } = useDirMenuLayout();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [alldir, setAllDir] = useState<DirMenuManagementData[]>([]);
  // Initialize state with all possible fields
  const [editValues, setEditValues] = useState<Partial<DirMenuManagementData>>({
    name: "",
    url: "",
    privCode: "",
    iconUrl: "",
  });
  // const mockBare: DirMenuManagementData[] = mockDirMenuData;
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  // const debouncedSearch = useDebounce(search, 150);

  // const normalizedPartys = useMemo(() => {
  //   return partys.map((p) => ({
  //     ...p,
  //     _name: p.name.toLowerCase(),
  //   }));
  // }, [partys]);

  // Filter suggestions from partys.privName
  const suggestions = useMemo(() => {
    //  console.log(showSuggestions, search, alldir, expanded);

    if (!showSuggestions) return [];
    if (!search) return [];
    if (!expanded.has("-1-0")) return [];
    const q = search.toLowerCase();
    return alldir.filter((p) => p.name.toLowerCase().includes(q));
  }, [showSuggestions, search, alldir, expanded]); // Add all dependencies

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DirMenuManagementData>({
    defaultValues: {
      name: "",
      url: "",
      code: "",
      privCode: "",
      iconUrl: "",
    },
  });

  // Reset form when editing row changes
  useEffect(() => {
    if (editingRowId !== null) {
      const editingRow = partys.find((row) => row.index === editingRowId);
      if (editingRow) {
        reset({
          name: editingRow.name || "",
          url: editingRow.url || "",
          privCode: editingRow.code || "",
          code: editingRow.code || "",
          iconUrl: editingRow.iconUrl || "",
        });
      }
    }
  }, [editingRowId, reset]);

  useEffect;

  const scrollToRow = useCallback((rowId: number) => {
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

  const getPathToNode = (
    data: DirMenuManagementData[],
    targetId: string | number,
  ): DirMenuManagementData[] => {
    const path: DirMenuManagementData[] = [];

    let current = data.find((x) => x.id === targetId);

    while (current) {
      path.unshift(current);
      current = current.parentId
        ? data.find((x) => x.id === current!.parentId)
        : baseDir;
    }

    return path;
  };

  const expandPath = async (path: DirMenuManagementData[]) => {
    if (path[0].parentId != -1) return;
    for (let i = 0; i < path.length; i++) {
      const node = { ...path[i], level: i };

      // if (!node) continue;
      // skip leaf nodes
      if (!node.hasChildren) continue;
      if (i === path.length - 1) scrollToRow(path[i].id);
      const isAlreadyExpanded = expanded.has(node.index ?? "");
      if (!isAlreadyExpanded) {
        await handleExpand(node); // your existing code
      }
    }
  };

  const handleSelect = async (row: DirMenuManagementData) => {
    setSearch(row.name ?? "");
    setShowSuggestions(false);
    setSelectedRow(row);

    // NEW: Expand parent directories if needed

    const path = await getPathToNode(alldir, row.id);

    //  console.log(path);

    await expandPath(path);

    // NEW: If the selected item is a directory, expand it too
    // if (row.type === "0" && !expanded.has(row.id)) {
    //   await handleExpand(row);
    // }

    // NEW: Scroll to the selected row
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToRow(row.id);
        setSelectedRow(row);
      });
    });
  };
  const baseDir: DirMenuManagementData = {
    type: "0",
    id: 0,
    parentId: -1,
    name: "Root of Directory & Menu",
    level: 0,
    hasChildren: true,
    index: "-1-0",
  };
  const initializeData = async () => {
    setIsLoading(true);

    const newPartys: DirMenuManagementData[] = [baseDir];
    try {
      setPartys(newPartys);
      handleExpand(newPartys[0]);

      hasFetched.current = true;
    } catch (error) {
      toast.error("Failed on initializing data");
    } finally {
      setIsLoading(false);
      // handleExpand(newPartys[0]);
    }
  };
  useEffect(() => {
    // const parseJson = JSON.parse(
    //   '{"boAccessName":"custOrder","commonDataId":"jA9t440q3SERQyA2VNHaarWf1DRdIlT3","dirtyList":[{"action":"OVERRIDE","bo":false,"boAccessName":"custOrder","filters":{},"flushed":false,"isRoot":"Y","location":{"accessNamePath":"/","array":false,"bo":true,"dataType":"BO","includeObjectId":"2f20e016-f047-4677-abe6-7df4b370f121","itemAccessName":"custOrder","itemType":"VI","parentArray":false},"value":{"SERV_TYPE":"15","CUST_ID":120265000,"CREATED_DATE":"2025-11-26 16:13:51","SP_ID":0,"ACCEPT_DATE":"2025-11-26 16:13:51","CUST_ORDER_ID":121219819,"ROUTING_ID":1,"OFFER_ID":"4","POS_SALE_MODE":1,"CONTACT_CHANNEL_ID":1,"A_PARTY_CODE":"120265000","ORDER_ITEM":[{"SERV_TYPE":15,"DP_OFFER_ORDER":[{"SERV_TYPE":386,"SP_ID":0,"ABS_EFF_DATE":"2025-09-26 16:28:29","OFFER_TYPE":"3","OFFER_NAME":"Incoming SMS","OFFER_ID":74,"OPERATION_TYPE":"X","OFFER_SEQ":"bc1ea1f1-ad27-4507-978a-b842e115018f","OLD_EFF_DATE":"2025-09-26 16:28:29","OFFER_INST_ID":121308009,"ORDER_ITEM_ID":121178084},{"SERV_TYPE":385,"SP_ID":0,"ABS_EFF_DATE":"2025-09-26 16:28:29","OFFER_TYPE":"3","OFFER_NAME":"Outgoing SMS","OFFER_ID":75,"OPERATION_TYPE":"X","OFFER_SEQ":"6cc2db5e-674a-4f3e-a1bc-5d6e971f2854","OLD_EFF_DATE":"2025-09-26 16:28:29","OFFER_INST_ID":121308010,"ORDER_ITEM_ID":121178084},{"SERV_TYPE":138,"SP_ID":0,"ABS_EFF_DATE":"2025-09-26 16:28:29","OFFER_TYPE":"3","OFFER_NAME":"Voice Service","OFFER_ID":72,"OPERATION_TYPE":"X","OFFER_SEQ":"dbf10cba-30f9-43ea-aa89-ff6379314a8b","OLD_EFF_DATE":"2025-09-26 16:28:29","OFFER_INST_ID":121308011,"ORDER_ITEM_ID":121178084},{"SERV_TYPE":139,"SP_ID":0,"ABS_EFF_DATE":"2025-09-26 16:28:29","OFFER_TYPE":"3","OFFER_NAME":"Data Service","OFFER_ID":73,"OPERATION_TYPE":"X","OFFER_SEQ":"e47b0868-18d0-4add-9876-926bf2fde2dc","OLD_EFF_DATE":"2025-09-26 16:28:29","OFFER_INST_ID":121308012,"ORDER_ITEM_ID":121178084},{"TIMER_EVENT_ID":1921,"DP_OFFER_ORDER_ATTR":[{"ATTR_VALUE":"1","OFFER_ID":213,"ATTR_ID":624,"OPERATION_TYPE":"X"},{"ATTR_VALUE":"1","OFFER_ID":213,"ATTR_ID":400003,"OPERATION_TYPE":"X"},{"ATTR_VALUE":"0","OFFER_ID":213,"ATTR_ID":400004,"OPERATION_TYPE":"X"}],"OLD_RESERVE_DATE":"2025-11-26 17:02:06","OFFER_ID":213,"OPERATION_TYPE":"X","OFFER_SEQ":"81145e84-6462-4a6a-abae-ca147f40cd91","RESERVE_DATE":"2025-11-26 17:02:06","REL_EXP_UNIT":"D","REL_EXP_OFFSET":3,"DUPLICATE_FLAG":"B"}],"ACCT":{"PAYMENT_METHOD_ID":1,"CUST_ID":120265000,"ROUTING_ID":1,"ACCT_ID":120255000,"STATE":"A","BILLING_CYCLE_TYPE_ID":1,"DELIVER_METHOD":"","PAYMENT_TYPE":"A","DEFAULT_FLAG":"N","PARTY_TYPE":"A","ACCT_NBR":"930255000","POSTPAID":"N","PARTY_CODE":"1"},"SUBS_PLAN_NAME":"SC_1000_Prepaid_Reguler","CUST_ORDER_ID":121219819,"OFFER_ID":4,"CONTACT_CHANNEL_ID":1,"IS_CHECK_OWE_CHARGE":true,"SUBS_EVENT_ID":189,"ORDER_NBR":"2025112621178084","ACCT_ID":120255000,"IS_RESERVE":false,"ORDER_TYPE":"B","OPERATION_TYPE":"A","SUBS_PLAN_ID":360,"CUST_ID":120265000,"SP_ID":0,"STATE_DATE":"2025-11-26 16:13:51","ORDER_STATE":"I","POS_SALE_MODE":1,"PREFIX":"670","IS_SAVED":true,"POSTPAID":"N","PROD_STATE":"A","SUBS_ID":121308008,"OFFER_NAME":"Telkomcel Prepaid Channel","ACC_NBR":"73007362","ORDER_ITEM_ID":121178084,"CUST_NAME":"Development Test"}],"CUST":{"CUST_ID":120265000,"ROUTING_ID":1,"CUST_TYPE":"A","CUST_CODE":"1120265000","CERT_ID":120011000,"CUST_NAME":"Development Test"},"SUBS_EVENT_ID":189,"CUST_CONTACT":{"CUST_ID":120265000,"CREATED_DATE":"2025-11-26 16:13:51","SP_ID":0,"PARTY_TYPE":"A","CUST_CONTACT_ID":187456619,"CONTACT_TYPE":"A","CONTACT_CHANNEL_ID":1,"RELA_ID":121219819,"CONTACT_EVENT_ID":"A","PARTY_CODE":"1"},"PARTY_TYPE":"A","SEND_PROVISIONING_FLAG":"Y","CUST_ORDER_NBR":"121219819","CREDIT_LIMIT_MODE":"0","A_PARTY_TYPE":"D","STAFF_INFO":{"AREA_ID":1,"ORG_ID":1,"STAFF_ID":1,"STAFF_JOB_ID":1},"PARTY_CODE":"1"},"valueType":"VI"}],"dsi":{},"errors":[],"hints":[],"rollbackList":[]}'
    // );
    // console.log(parseJson);

    if (!hasFetched.current) {
      initializeData();
    }
  }, []);

  const fetchChild = async (
    id: number,
    level: number = 1,
    index: string,
  ): Promise<DirMenuManagementData[]> => {
    const resp = await GetData(`${API_URL}/api/dirs/all-dirs-or-menu`, {
      parentId: id === 0 ? null : id,
    });

    const temp: DirMenuManagementData[] = resp.data.map(
      (item: DirMenuManagementData) =>
        (item = {
          ...item,
          parentId: item.parentId === null ? 0 : item.parentId,
          parentIndex: index,
          level: level + 1,
          index: `${item.parentId === null ? 0 : item.parentId}-${item.id}`,
        }),
    );
    if (id === 0) setAllDir([baseDir, ...temp]);
    const child: DirMenuManagementData[] = temp.filter(
      (item: DirMenuManagementData) => {
        if (item.parentId && item.parentId === id) return true;
        // else true;
        else if (!item.parentId && id === 0) return true;
      },
    );

    // console.log(child);

    return child;
  };
  // Recursively remove all children of given parentId
  const removeChildrenRecursively = (
    data: DirMenuManagementData[],
    parentIndex: string,
  ): DirMenuManagementData[] => {
    // console.log(parentId);

    const childIds = new Set<string>();
    const collectChildren = (id: string) => {
      data.forEach((item) => {
        if (item.parentIndex === id) {
          if (item.type == "0") {
            setExpanded((prev) => {
              const copy = new Set(prev);
              copy.delete(item.index ?? "");
              return copy;
            });
          }
          childIds.add(item.index ?? "");
          collectChildren(item.index ?? ""); // Recursively collect
        }
      });
    };
    collectChildren(parentIndex);

    return data.filter((item) => !childIds.has(item.index ?? ""));
  };

  const onSubmit = async (formData: DirMenuManagementData) => {
    const editingRow = partys.find((row) => row.index === editingRowId);
    if (editingRow) {
      //  console.log(formData);
      const datatosave: DirMenuManagementData = { ...editValues, ...formData };

      setEditValues((prev) => ({ ...prev, ...formData }));
      //  console.log({ ...editValues, ...formData }, "ini");

      // Your existing save logic here
      // await setEditValues(formData);
      handleSave(datatosave);
    }
  };

  const handleExpand = async (row: DirMenuManagementData) => {
    setIsExpanding(true);
    setSelectedRow(row);

    try {
      const isExpanded = expanded.has(row.index ?? "");

      if (isExpanded) {
        setPartys((prev) => removeChildrenRecursively(prev, row.index ?? ""));
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(row.index ?? "");
          return copy;
        });
      } else {
        let children: DirMenuManagementData[] = [];
        if (row.type === "0") {
          // setAvailableComponents([]);
          const temp = await fetchChild(
            row.id,
            row.level ?? 0,
            row.index ?? "",
          );

          children = [...temp];
          setExpanded((prev) => new Set(prev).add(row.index ?? ""));
        }
        setPartys((prev) => {
          const index = prev.findIndex((p) => p.id === row.id);
          const updated = [...prev];
          updated.splice(index + 1, 0, ...children);
          return updated;
        });
      }
    } catch (error) {
      toast.error("Failed to expand directory");
    } finally {
      setIsExpanding(false);
    }
  };

  const handleCloseParent = async (parentId: number, close: boolean) => {
    setIsLoading(true);
    try {
      const parent = partys.find((item) => item.id === parentId);
      if (parent) {
        if (close) {
          return handleExpand(parent);
        }
        const child: DirMenuManagementData[] = await fetchChild(
          parent.id,
          parent.level,
          parent.index ?? "",
        );

        const edited = child.find((item) => item.id === editValues.id);

        setPartys((prev) => {
          return prev.map((item) => {
            if (item.id === edited?.id) return edited;
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

  const handleEdit = (row: DirMenuManagementData) => {
    setEditingRowId(row.index ?? "");
    setEditValues(row); // copy current row values
    // console.log({ ...row, privCode: row.code });
  };

  const handleSave = useCallback(
    async (data: DirMenuManagementData) => {
      setIsLoading(true);

      try {
        if (data.type === "0") {
          const payload = {
            dirId: data.id,
            dirName: data.name,
            parentId: data.parentId,
            iconUrl: data.iconUrl,
            spId: 0,
            comments: "",
          };

          const resp = await PutData(`${API_URL}/api/dirs/mod-dir`, payload);

          if (resp?.status) return toast.success(resp.message);
          toast.error(resp?.message);
        } else {
          const payload = {
            menuId: data.id,
            menuName: data.name,
            menuType: data.type,
            iconUrl: data.iconUrl,
            priv: {
              // appId: 0,
              privId: data.id,
              privType: data.type,
              privCode: data.code,
              privName: data.name,
              // privEl: data.el,
              url: data.url,
              // comments: data,
              // isAuthorized: "string",
              // isHold: "string",
              spId: 0,
            },
            spId: 0,
            // specialCondition: "string",
          };
          const resp = await PutData(`${API_URL}/api/dirs/mod-menu`, payload);

          if (resp?.status) return toast.success(resp.message);
          toast.error(resp?.message);
        }
      } catch (error) {
        toast.error("Failed editing data");
      } finally {
        //  console.log("Edited values:", editValues);
        setEditingRowId(null);
        handleCloseParent(editValues.parentId ?? 0, false);
      }
    },
    [editValues],
  );

  // Column
  const AvailableColumn = useMemo<ColumnDef<DirMenuManagementData>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal/Directory Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const data = row.original;
          const isEditing = editingRowId === data.index;
          const isExpand = expanded.has(row.original.index ?? "");

          if (isEditing) {
            return (
              <div style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}>
                <Input
                  {...register("name", {
                    required: "Name is required",
                    // onChange: (e) => {
                    //   row.original.name = e.target.value;
                    // },
                  })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </span>
                )}
              </div>
            );
          }

          return (
            <DefaultTooltip placement="top" title={data.name}>
              <div
                style={{
                  paddingLeft: `${(data.level ?? 0) * 1.5}rem`,
                  cursor: "pointer",
                }}
                onClick={() => handleExpand(data)}
              >
                <KeenIcon
                  icon={
                    data.type === "0" ? (isExpand ? "down" : "right") : "menu"
                  }
                  className="inline-block mx-2"
                />
                {data.name}
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
        accessorFn: (row) => row.url,
        id: "url",
        header: ({ column }) => (
          <DataGridColumnHeader title="Menu Url" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          const data = row.original;
          const isEditing = editingRowId === data.index;

          if (isEditing && data.type === "1") {
            return (
              <div>
                <Input
                  {...register("url", {
                    // onChange: (e) => {
                    //   data.url = e.target.value;
                    // },
                  })}
                  className={errors.url ? "border-red-500" : ""}
                />
                {errors.url && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.url.message}
                  </span>
                )}
              </div>
            );
          }
          return (
            <DefaultTooltip placement="top" title={row.original.url}>
              <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {row.original.url}
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
        accessorFn: (row) => row.code,
        id: "code",
        header: ({ column }) => (
          <DataGridColumnHeader title="Privelage Code" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          const data = row.original;
          const isEditing = editingRowId === data.index;

          if (isEditing && data.type === "1") {
            return (
              <div>
                <Input
                  // value={editValues.privCode}
                  {...register("code", {
                    // onChange: (e) => {
                    //   data.code = e.target.value;
                    // },
                  })}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.code.message}
                  </span>
                )}
              </div>
            );
          }
          return (
            <DefaultTooltip placement="top" title={data.code}>
              <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {data.code}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 text-ellipsis whitespace-nowrap ",
          cellClassName: "max-w-[150px] text-elipsis overflow-hidden",
        },
      },
      {
        accessorFn: (row) => row.iconUrl,
        id: "iconUrl",
        header: ({ column }) => (
          <DataGridColumnHeader title="Icon Url" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          const data = row.original;
          const isEditing = editingRowId === data.index;

          if (isEditing) {
            return (
              <IconSelector
                watch={watch}
                register={register}
                setValue={setValue}
              />
            );
          }
          return (
            <DefaultTooltip placement="top" title={row.original.iconUrl}>
              <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap items-center flex flex-row gap-2">
                <KeenIcon icon={row.original.iconUrl ?? ""} />
                {row.original.iconUrl}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 w-[400px] text-ellipsis whitespace-nowrap ",
          cellClassName: "max-w-[400px] text-elipsis overflow-hidden",
        },
      },
      {
        id: "options",
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
          const isDisable = data.id === 0;
          const isEditing = editingRowId === data.index;

          if (isDisable) return null;

          return (
            <div className="flex items-center justify-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    onClick={handleSubmit(onSubmit)}
                    type="button"
                  >
                    <KeenIcon icon="check" />
                  </Button>
                  <Button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    onClick={() => {
                      setEditingRowId(null);
                      reset();
                    }}
                    type="button"
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
                  <AccessWrapper
                    hasAccess={menuPrivAccess?.deleteStatus}
                    enabledText="Delete"
                  >
                    <Button
                      className="btn btn-sm btn-icon btn-clear btn-light"
                      onClick={() => handleDelete(row.original)}
                    >
                      <KeenIcon icon="trash" />
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
    [
      expanded,
      selectedRow?.id,
      editingRowId,
      register,
      watch,
      setValue,
      errors,
      handleSubmit,
      reset,
    ],
  );

  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number) => {
      return {
        data: partys,
        totalCount: partys.length,
      };
    },
    [partys], // Proper dependencies
  );

  const handleDelete = (data: DirMenuManagementData) => {
    setDesc(`Deleting  ${data?.name}`);
    //  console.log(data);

    setSelectedRow(data);
    setShowConfirm(true);
    setOnConfirm(() => () => onDelete(data));
  };

  const onDelete = async (data: DirMenuManagementData) => {
    //  console.log(`Deleting  ${data.id} ${data.name}`);
    try {
      if (data.type === "0") {
        const resp = await DeleteData(
          `${API_URL}/api/dirs/del-dir/${data.id}?spId=0`,
          {},
        );

        if (resp?.status) {
          return toast.success(resp.message);
        }
        return toast.error(resp?.message);
      } else {
        const resp = await DeleteData(
          `${API_URL}/api/dirs/del-dir-menu-from-dir?dirId=${data.parentId}&menuIds=${data.id}&spId=0`,
          {},
        );

        if (resp?.status) {
          return toast.success(resp.message);
        }
        return toast.error(resp?.message);
      }
    } catch (error) {
      return toast.error("Error deleting data");
    } finally {
      setShowConfirm(false);
      // initializeData();
      handleCloseParent(data.parentId ?? 0, true);
    }
  };

  useEffect(() => {
    if (!showMenuSelector) handleCloseParent(selectedRow?.parentId ?? 0, true);
  }, [showMenuSelector]);

  return (
    <div className="bg-white p-5 mx-5 rounded-md shadow-md space-y-2">
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
              if (!showSuggestions) setShowSuggestions(true);
            }}
            // onKeyDownCapture={(e) => {
            //   if (e.key === "Enter") setShowSuggestions(true);
            // }}
            onBlur={() => setShowSuggestions(false)} // delay so click still works
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
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        {(isLoading || isExpanding) && <Loading />}
        <DataGridProvider
          key={`available-features-grid`}
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
            className:
              row.original.index === selectedRow?.index
                ? selectedRowHighLight
                : nonSelectedRowHighLight,
            onClick: () => setSelectedRow(row.original),
            // ADD THIS REF CALLBACK:
            ref: (el: HTMLTableRowElement) => {
              if (el) {
                rowRefs.current.set(row.original.id, el);
              } else {
                rowRefs.current.delete(row.original.id);
              }
            },
          })}
        >
          <div
            className="h-[50dvh] overflow-y-auto w-full border-2"
            ref={tableContainerRef}
          >
            <DataGridTable />
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};
