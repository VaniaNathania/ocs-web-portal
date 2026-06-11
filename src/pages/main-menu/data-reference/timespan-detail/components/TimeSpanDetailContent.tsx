import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimeSpanContext } from "../hooks/useTimeSpanContext";
import { useEffect, useState } from "react";
import {
  TimeSpanDetailContentForm,
  TimeSpanDetailContentTypeSchema,
} from "../schema/timeSpanDetailType.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
dayjs.extend(customParseFormat);

type mode = "view" | "new" | "edit";

const API_URL_REF = apiConfigRef.ref;

const TimeSpanDetailContent = () => {
  const { PostData, PutData, DeleteData } = useCallApi();
  const {
    selectedItemContent,
    setSelectedItemContent,
    selectedItemSidebar,
    fetchTimeSpanDetail,
    editTrigger,
    deleteTrigger,
  } = useTimeSpanContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<mode>("view");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<TimeSpanDetailContentForm>({
    resolver: zodResolver(TimeSpanDetailContentTypeSchema),
    defaultValues: {
      timeSpanId: selectedItemSidebar?.timeSpanId,
      cycleBeginDate: "",
      cycleBeginTimeReAttr: "",
      cycleUnit: 0,
      timeUnit: "",
      duration: 0,
    },
  });

  //  console.log(errors);

  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    //  console.log(totalSeconds);
    setValue("duration", totalSeconds);
  }, [hours, minutes, seconds, setValue]);

  useEffect(() => {
    const parseDuration = (duration?: number) => {
      const dur = duration || 0;
      const h = Math.floor(dur / 3600);
      const m = Math.floor((dur % 3600) / 60);
      const s = dur % 60;
      return { h, m, s };
    };

    if (!selectedItemContent) {
      reset({
        cycleBeginDate: "",
        cycleBeginTimeReAttr: "",
        cycleUnit: 0,
        timeUnit: "",
        duration: 0,
      });
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setMode("view");
      return;
    }

    const { cycleBeginDate, duration } = selectedItemContent;
    const possibleFormats = [
      "MM/DD/YYYY",
      "DD-MM-YYYY",
      "YYYY-MM-DD",
      "YYYY/MM/DD",
      "DD/MM/YYYY",
    ];

    const finalDate = cycleBeginDate?.split("T")[0] ?? "";
    const finalTime = cycleBeginDate?.split("T")[1] ?? "";
    const formattedDate = finalDate
      ? dayjs(finalDate, possibleFormats, true).format("YYYY-MM-DD")
      : "";
    const { h, m, s } = parseDuration(duration);

    reset({
      cycleBeginDate: formattedDate,
      cycleBeginTimeReAttr: finalTime,
      cycleUnit: selectedItemContent.cycleUnit,
      timeUnit: selectedItemContent.timeUnit,
      duration: duration,
    });

    setHours(h);
    setMinutes(m);
    setSeconds(s);
    setMode("view");
  }, [selectedItemContent, reset]);

  useEffect(() => {
    if (editTrigger > 0 && selectedItemContent) {
      handleEdit();
    }
  }, [editTrigger]);

  useEffect(() => {
    if (deleteTrigger > 0 && selectedItemContent) {
      handleDelete();
    }
  }, [deleteTrigger]);

  const onSubmit = async (data: TimeSpanDetailContentForm) => {
    setIsSubmitting(true);
    const { cycleBeginTimeReAttr, ...final } = data;
    if (mode === "new") {
      try {
        const payloadNew = {
          ...final,
          spId: 0,
        };
        const response = await PostData(
          `${API_URL_REF}/api/time-span/add-time-span-detail`,
          payloadNew,
        );
        if (response?.status) {
          toast.success("Success");
          await fetchTimeSpanDetail();
          setMode("view");
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === "edit") {
      try {
        const payloadMod = {
          ...final,
          seq: selectedItemContent?.id.seq,
          spId: 0,
        };
        const response = await PutData(
          `${API_URL_REF}/api/time-span/mod-time-span-detail`,
          payloadMod,
        );
        if (response?.status) {
          toast.success("Success");
          setMode("view");
          const newData = await fetchTimeSpanDetail();

          const lastItem = newData?.find(
            (item) => item.id.seq === payloadMod.seq,
          );
          //  console.log(lastItem, data, "lastitem");

          if (lastItem) {
            setSelectedItemContent(lastItem);
          }
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleNew = () => {
    //  console.log("TRIGER NEW");
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    reset({
      timeSpanId: selectedItemSidebar?.timeSpanId,
      cycleBeginDate: "",
      cycleBeginTimeReAttr: "",
      cycleUnit: 0,
      timeUnit: "",
      duration: 0,
    });
    setMode("new");
  };

  const handleEdit = () => {
    setMode("edit");

    if (selectedItemContent) {
      const { cycleBeginDate, duration } = selectedItemContent;
      const finalDate = cycleBeginDate?.split("T")[0] ?? "";
      const finalTime = cycleBeginDate?.split("T")[1] ?? "";
      const possibleFormats = [
        "MM/DD/YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
        "YYYY/MM/DD",
        "DD/MM/YYYY",
      ];
      const formattedDate = finalDate
        ? dayjs(finalDate, possibleFormats, true).format("YYYY-MM-DD")
        : "";
      reset({
        timeSpanId: selectedItemContent.id.timeSpanId,
        cycleBeginDate: formattedDate,
        cycleBeginTimeReAttr: finalTime,
        cycleUnit: selectedItemContent.cycleUnit,
        timeUnit: selectedItemContent.timeUnit,
        duration: duration,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    try {
      const response = await DeleteData(
        `${API_URL_REF}/api/time-span/del-time-span-detail/${selectedItemContent?.id.timeSpanId}/${selectedItemContent?.id.seq}`,
        {
          timeSpanId: selectedItemContent?.id.timeSpanId,
          seq: selectedItemContent?.id.seq,
        },
      );
      if (response?.status) {
        toast.success("Success");
        await fetchTimeSpanDetail();
        setMode("view");
        setIsDeleteOpen(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    const parseDuration = (duration?: number) => {
      const dur = duration || 0;
      const h = Math.floor(dur / 3600);
      const m = Math.floor((dur % 3600) / 60);
      const s = dur % 60;
      return { h, m, s };
    };

    if (selectedItemContent) {
      const { cycleBeginDate, duration } = selectedItemContent;
      const finalDate = cycleBeginDate?.split("T")[0] ?? "";
      const finalTime = cycleBeginDate?.split("T")[1] ?? "";
      const possibleFormats = [
        "MM/DD/YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
        "YYYY/MM/DD",
        "DD/MM/YYYY",
      ];
      const formattedDate = finalDate
        ? dayjs(finalDate, possibleFormats, true).format("YYYY-MM-DD")
        : "";
      const { h, m, s } = parseDuration(duration);
      reset({
        cycleBeginDate: formattedDate,
        cycleBeginTimeReAttr: finalTime,
        cycleUnit: selectedItemContent.cycleUnit,
        timeUnit: selectedItemContent.timeUnit,
      });

      setHours(h);
      setMinutes(m);
      setSeconds(s);
    } else {
      reset({
        cycleBeginDate: "",
        cycleBeginTimeReAttr: "",
        cycleUnit: 0,
        timeUnit: "",
      });
    }
    setMode("view");
  };

  return (
    <div className="p-2">
      <h1 className="font-semibold">Detail</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">
              <span className="text-red-500">*</span>Start Date
            </Label>
            <div className="flex-1">
              <input
                className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400" : ""}`}
                {...register("cycleBeginDate")}
                disabled={mode === "view"}
                type="date"
              />
              {errors.cycleBeginDate && (
                <p className="text-sm text-red-500">
                  {errors.cycleBeginDate.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">
              <span className="text-red-500">*</span>Start Time
            </Label>
            <div className="flex-1">
              <input
                className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400" : ""}`}
                {...register("cycleBeginTimeReAttr")}
                disabled={mode === "view"}
                type="time"
                step="1"
              />
              {errors.cycleBeginTimeReAttr && (
                <p className="text-sm text-red-500">
                  {errors.cycleBeginTimeReAttr.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">
              <span className="text-red-500">*</span>Cycle
            </Label>
            <div className="flex-1">
              <div className="flex flex-row gap-2 w-full">
                <Input
                  className="w-1/2 h-[30px] border rounded border-gray-300 p-1"
                  type="number"
                  {...register("cycleUnit", { valueAsNumber: true })}
                  disabled={mode === "view"}
                  min={0}
                  step={1}
                />
                <Controller
                  name="timeUnit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={mode === "view"}
                    >
                      <SelectTrigger className="w-1/2 h-[30px]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Y" className="text-sm">
                          Year
                        </SelectItem>
                        <SelectItem value="M" className="text-sm">
                          Month
                        </SelectItem>
                        <SelectItem value="W" className="text-sm">
                          Week
                        </SelectItem>
                        <SelectItem value="D" className="text-sm">
                          Day
                        </SelectItem>
                        <SelectItem value="S" className="text-sm">
                          Exact Time(For Once)
                        </SelectItem>
                        <SelectItem value="H" className="text-sm">
                          Hours
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.cycleUnit && (
                <p className="text-red-500 text-sm">
                  {errors.cycleUnit.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">
              <span className="text-red-500">*</span>Duration
            </Label>
            <div className="flex-1">
              <div className="flex flex-row gap-2">
                {/* Hours */}
                <div className="flex flex-row w-1/3">
                  <Input
                    className="w-1/2 h-[30px]"
                    type="number"
                    min={0}
                    step={1}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    disabled={mode === "view"}
                  />
                  <Label className="text-sm p-1 w-1/2 truncate" title="Hours">
                    Hours
                  </Label>
                </div>
                {/* Minutes */}
                <div className="flex flex-row w-1/3">
                  <Input
                    className="w-1/2 h-[30px]"
                    type="number"
                    min={0}
                    max={59}
                    step={1}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    disabled={mode === "view"}
                  />
                  <Label className="text-sm p-1 w-1/2 truncate" title="Minutes">
                    Minutes
                  </Label>
                </div>
                {/* Seconds */}
                <div className="flex flex-row w-1/3">
                  <Input
                    className="w-1/2 h-[30px]"
                    type="number"
                    min={0}
                    max={59}
                    step={1}
                    value={seconds}
                    onChange={(e) => setSeconds(Number(e.target.value))}
                    disabled={mode === "view"}
                  />
                  <Label className="text-sm p-1 w-1/2 truncate" title="Seconds">
                    Seconds
                  </Label>
                </div>
              </div>
              {/* {errors.duration && <p className="text-red-500">{errors.duration.message}</p>} */}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-1 mt-3">
          {mode === "view" ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white "
                onClick={(e) => {
                  e.preventDefault();
                  handleNew();
                }}
              >
                New
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white "
                type="submit"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </form>
      <PopUpDialog
        desc="This action cannot be undone!"
        isOpen={isDeleteOpen}
        handleDialog={setIsDeleteOpen}
        onConfirm={onDeleteConfirm}
        bgOn={false}
        // type="alert"
      />
    </div>
  );
};

export default TimeSpanDetailContent;
