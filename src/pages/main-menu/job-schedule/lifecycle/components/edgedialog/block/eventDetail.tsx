import { Label } from "@/components/ui/label";
import { useEdgeDialog } from "../hooks/context";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/pages/main-menu/role-management/generalUseComp";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { Controller } from "react-hook-form";
import { useLifeCycle } from "../../../hooks/context";
import { ColumnDef } from "@tanstack/react-table";
import { EventProcess } from "../../../types/zodTypes";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EventDetail = () => {
  const {
    eventList,
    adviceTypes,
    isLoading,
    recAdvice,
    eventDetail,
    lcBc,
    lcBcFunc,
    control,
    register,
    setValue,
    setRecAdvice,
    subsEvent,
    errors,
    trigger,
    watch,
  } = useEdgeDialog();

  const { isEditing } = useLifeCycle();

  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [rowBackup, setRowBackup] = useState<EventProcess | null>(null);

  // ✅ search states
  const [searchSubsEvent, setSearchSubsEvent] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchTable, setSearchTable] = useState<Record<number, string>>({});

  const formVal = watch();

  const isProcessValid = async () => {
    const valid = await trigger("eventProcess");
    if (valid) {
      setEditingRowIdx(null);
      setRowBackup(null);
    }
  };

  const initEventProcess: EventProcess = {
    priority: "",
    bcId: "0",
    avp: "",
  };

  const addNewEventProcess = () => {
    const { eventProcess } = formVal;
    const findDefaultBcID = eventProcess.find((ep) => ep.bcId === "0");
    if (findDefaultBcID) return;

    setValue("eventProcess", [...eventProcess, initEventProcess]);
    setEditingRowIdx(eventProcess.length);
  };

  const filteredSubsEvent = useMemo(() => {
    if (!eventList) return subsEvent;

    const usedSubsEventIds = new Set(
      eventList
        .filter((evn) => evn.subsEventId !== eventDetail?.subsEventId)
        .map((evn) => evn.subsEventId),
    );

    return subsEvent.filter(
      (evn) => !usedSubsEventIds.has(evn.subsEventId.toString()),
    );
  }, [subsEvent, eventList, eventDetail]);

  // ✅ apply search + limit
  const subsEventOptions = useMemo(
    () =>
      filteredSubsEvent
        .filter((item) =>
          item.eventName.toLowerCase().includes(searchSubsEvent.toLowerCase()),
        )
        .slice(0, 20),
    [filteredSubsEvent, searchSubsEvent],
  );

  const serviceOptions = useMemo(
    () =>
      lcBc
        .filter((item) =>
          item.bcName?.toLowerCase().includes(searchService.toLowerCase()),
        )
        .slice(0, 20),
    [lcBc, searchService],
  );

  const columns = useMemo<ColumnDef<EventProcess>[]>(
    () => [
      {
        accessorFn: (row) => row.priority,
        id: "priority",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Priority" />
        ),
        cell: ({ row }) => (
          <Controller
            control={control}
            name="eventProcess"
            render={({ field }) => (
              <Input
                disabled={!isEditing || editingRowIdx !== row.index}
                value={field.value[row.index]?.priority}
                onChange={(e) => {
                  const newValue = [...field.value];
                  newValue[row.index] = {
                    ...newValue[row.index],
                    priority: e.target.value,
                  };
                  field.onChange(newValue);
                }}
              />
            )}
          />
        ),
      },
      {
        accessorFn: (row) => row.bcId,
        id: "bcId",
        header: () => (
          <div>
            Operation Module <span className="text-red-500">*</span>
          </div>
        ),
        cell: ({ row }) => {
          const err = !!errors.eventProcess?.[row.index]?.bcId?.message;
          const search = searchTable[row.index] || "";

          // const filtered = lcBcFunc
          //   .filter((item) =>
          //     item.bcName.toLowerCase().includes(search.toLowerCase()),
          //   )
          //   .slice(0, 20);

          return (
            <Controller
              control={control}
              name="eventProcess"
              render={({ field }) => {
                const selected = lcBcFunc.find(
                  (item) =>
                    item.bcId.toString() === field.value[row.index]?.bcId,
                );

                return (
                  <Popover>
                    <div className="relative" title={selected?.bcName}>
                      <PopoverTrigger asChild title={selected?.bcName}>
                        <Button
                          variant="outline"
                          className={`max-w-[180px] truncate justify-start ${
                            err ? "border-red-500" : ""
                          }`}
                          disabled={!isEditing || editingRowIdx !== row.index}
                        >
                          {selected ? selected.bcName : "Please Select"}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="p-0 w-[220px] absolute bottom-0 translate-y-[100%] -translate-x-[50%]">
                        <Command className="">
                          <CommandInput
                            placeholder="Search..."
                            // value={search}
                            // onValueChange={(val) =>
                            //   setSearchTable((prev) => ({
                            //     ...prev,
                            //     [row.index]: val,
                            //   }))
                            // }
                          />
                          <CommandEmpty>No results.</CommandEmpty>
                          <CommandGroup>
                            {lcBcFunc.map((item) => (
                              <CommandItem
                                key={item.bcId}
                                onSelect={() => {
                                  const newValue = [...field.value];
                                  newValue[row.index] = {
                                    ...newValue[row.index],
                                    bcId: item.bcId.toString(),
                                  };
                                  field.onChange(newValue);
                                }}
                                className=""
                              >
                                {item.bcName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          {/* 
                        {filtered.length === 20 && (
                          <div className="text-xs p-2 text-muted-foreground">
                            Showing first 20 results
                          </div>
                        )} */}
                        </Command>
                      </PopoverContent>
                    </div>
                  </Popover>
                );
              }}
            />
          );
        },
      },
      {
        accessorFn: (row) => row.avp,
        id: "avp",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Component Parameter" />
        ),
        cell: ({ row }) => (
          <Controller
            control={control}
            name="eventProcess"
            render={({ field }) => (
              <Input
                disabled={!isEditing || editingRowIdx !== row.index}
                value={field.value[row.index]?.avp}
                onChange={(e) => {
                  const newValue = [...field.value];
                  newValue[row.index] = {
                    ...newValue[row.index],
                    avp: e.target.value,
                  };
                  field.onChange(newValue);
                }}
              />
            )}
          />
        ),
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="action" />
        ),
        cell: ({ row }) => {
          if (editingRowIdx === row.index) {
            return (
              <div className="flex gap-2">
                <Button size="sm" variant={"ghost"} onClick={isProcessValid}>
                  <KeenIcon icon="check" />
                </Button>
                <Button
                  size="sm"
                  variant={"ghost"}
                  onClick={() => {
                    if (rowBackup && editingRowIdx !== null) {
                      const current = formVal.eventProcess;
                      const newValue = [...current];
                      newValue[editingRowIdx] = rowBackup;
                      setValue("eventProcess", newValue);
                    }
                    setEditingRowIdx(null);
                    setRowBackup(null);
                  }}
                >
                  <KeenIcon icon="cross" />
                </Button>
              </div>
            );
          }

          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={"ghost"}
                onClick={() => {
                  const currentRow = formVal.eventProcess?.[row.index];
                  setRowBackup({ ...currentRow });
                  setEditingRowIdx(row.index);
                }}
                disabled={!isEditing}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>

              <Button
                size="sm"
                variant={"ghost"}
                onClick={() => {
                  const newValue = formVal.eventProcess.filter(
                    (_, i) => i !== row.index,
                  );
                  setValue("eventProcess", newValue);
                }}
                disabled={!isEditing}
              >
                <KeenIcon icon="trash" />
              </Button>
            </div>
          );
        },
      },
    ],
    [editingRowIdx, errors, formVal],
  );

  if (!eventDetail)
    return (
      <div>
        No Event to show
        {isLoading && <Loading />}
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Loading />}

      <div className="grid grid-cols-2 gap-2">
        {/* Subscription Event */}
        <div className="flex gap-2 items-center">
          <Label className="w-20">
            Subscription Event<span className="text-red-500">*</span>
          </Label>

          <Controller
            name="subsEventId"
            control={control}
            render={({ field }) => {
              const selected = filteredSubsEvent.find(
                (e) => e.subsEventId.toString() === field.value?.toString(),
              );

              return (
                <div
                  className="flex flex-1 min-w-0"
                  title={selected?.eventName ?? "Event Name"}
                >
                  <Popover>
                    <PopoverTrigger
                      asChild
                      className="flex-1 flex"
                      disabled={!isEditing}
                      // title={selected?.eventName}
                    >
                      <Button
                        className="justify-start flex-1 truncate"
                        variant="outline"
                        // title={selected?.eventName || "Please Select"}
                      >
                        {selected?.eventName || "Please Select"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search..."
                          value={searchSubsEvent}
                          onValueChange={setSearchSubsEvent}
                        />
                        <CommandEmpty>No results</CommandEmpty>
                        <CommandGroup>
                          {subsEventOptions.map((item) => (
                            <CommandItem
                              key={item.subsEventId}
                              onSelect={() =>
                                field.onChange(item.subsEventId.toString())
                              }
                            >
                              {item.eventName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            }}
          />
        </div>

        <div className="flex gap-2 items-center">
          <Label className="w-20">Timer(Day)</Label>
          <Input
            disabled={!isEditing}
            type="number"
            className="flex-1"
            {...register("timer", { setValueAs: (v) => Number(v) })}
          />
        </div>

        {/* Service */}
        <div className="flex gap-2 items-center">
          <Label className="w-20">Service</Label>

          <Controller
            name="bcId"
            disabled={!isEditing}
            control={control}
            render={({ field }) => {
              const selected = lcBc.find(
                (e) => e.bcId.toString() === field.value?.toString(),
              );

              return (
                <div
                  className="flex flex-1 min-w-0 gap-1"
                  title={selected?.bcName ?? "Event Name"}
                >
                  <Popover>
                    <PopoverTrigger
                      asChild
                      className="flex-1"
                      disabled={!isEditing}
                      title={selected?.bcName || "Please Select"}
                    >
                      <Button
                        className="justify-start flex-1 truncate"
                        variant="outline"
                        title={selected?.bcName || "Please Select"}
                      >
                        {selected?.bcName || "Please Select"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search..."
                          value={searchService}
                          onValueChange={setSearchService}
                        />
                        <CommandEmpty>No results</CommandEmpty>
                        <CommandGroup>
                          {serviceOptions.map((item) => (
                            <CommandItem
                              key={item.bcId}
                              onSelect={() =>
                                field.onChange(item.bcId.toString())
                              }
                            >
                              {item.bcName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {field.value && (
                    <Button
                      disabled={field.disabled}
                      variant={"outline"}
                      onClick={() => field.onChange("")}
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  )}
                </div>
              );
            }}
          />
        </div>

        <div className="flex gap-2 items-center">
          <Label className="w-20">Advice Type</Label>
          <div className="flex-1">
            <MultiSelect
              disabled={!isEditing}
              rows={adviceTypes}
              keyRow="adviceType"
              showKeyRow="adviceTypeName"
              setAction={setRecAdvice}
              action={recAdvice}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Label className="w-20">Process</Label>
          <Button size="sm" onClick={addNewEventProcess} disabled={!isEditing}>
            <KeenIcon icon="plus" /> Add
          </Button>
        </div>
      </div>

      <DataGridProvider
        columns={columns}
        pagination={{ size: 10 }}
        layout={{ card: true }}
        data={formVal.eventProcess}
      />
    </div>
  );
};

export default EventDetail;
