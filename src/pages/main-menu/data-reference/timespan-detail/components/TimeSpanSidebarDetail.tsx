import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useTimeSpanContext } from "../hooks/useTimeSpanContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TimeSpanDetailSidebarForm,
  TimeSpanDetailSidebarTypeSchema,
} from "../schema/timeSpanDetailType.schema";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { TimeSpanDatasProps } from "../hooks/SpanTimeContext";

type mode = "view" | "new" | "edit";

const API_URL_REF = apiConfigRef.ref;

const TimeSpanSidebarDetail = () => {
  const { PostData, PutData, DeleteData } = useCallApi();
  const {
    selectedItemSidebar,
    setSelectedItemSidebar,
    timeSpanDatas,
    fetchTimeSpan,
  } = useTimeSpanContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<mode>("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimeSpanDetailSidebarForm>({
    resolver: zodResolver(TimeSpanDetailSidebarTypeSchema),
    defaultValues: {
      timeSpanName: "",
      comments: null,
    },
  });

  useEffect(() => {
    const firstItem = timeSpanDatas[0];
    if (!selectedItemSidebar) {
      setSelectedItemSidebar(firstItem);
      reset({
        timeSpanName: firstItem?.timeSpanName,
        comments: firstItem?.comments ?? null,
      });
    } else {
      reset({
        timeSpanName: selectedItemSidebar.timeSpanName,
        comments: selectedItemSidebar.comments ?? null,
      });
      setMode("view");
    }
  }, [selectedItemSidebar, timeSpanDatas, reset]);

  const handleNew = () => {
    //  console.log("CLICKED");
    reset({
      timeSpanName: "",
      comments: null,
    });
    setMode("new");
  };

  const onSubmit = async (data: TimeSpanDetailSidebarForm) => {
    //  console.log("🚀 onSubmit triggered", mode, data);
    setIsSubmitting(true);
    if (mode === "new") {
      try {
        const payloadNew = {
          ...data,
          spId: 0,
        };
        const response = await PostData(
          `${API_URL_REF}/api/time-span/add-time-span`,
          payloadNew,
        );

        if (response?.status) {
          toast.success("Success");
          setMode("view");
          fetchTimeSpan();
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
          ...data,
          timeSpanId: selectedItemSidebar?.timeSpanId,
          spId: 0,
        };
        const response = await PutData(
          `${API_URL_REF}/api/time-span/mod-time-span`,
          payloadMod,
        );
        if (response?.status) {
          toast.success("Success");
          setMode("view");
          const newData = await fetchTimeSpan();

          const lastItem = newData?.find(
            (item: TimeSpanDatasProps) =>
              item.timeSpanName === data.timeSpanName,
          );

          if (lastItem) {
            setSelectedItemSidebar(lastItem);
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

  const handleEdit = () => {
    setMode("edit");
    if (selectedItemSidebar) {
      reset({
        timeSpanName: selectedItemSidebar.timeSpanName,
        comments: selectedItemSidebar.comments,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    const timeSpanId = selectedItemSidebar?.timeSpanId;
    setIsSubmitting(true);
    if (!timeSpanId) return;
    try {
      const response = await DeleteData(
        `${API_URL_REF}/api/time-span/del-time-span/${timeSpanId}`,
        timeSpanId,
      );
      if (response?.status) {
        toast.success("Success");
        setMode("view");
        fetchTimeSpan();
        setIsDeleteOpen(false);

        const firstItem = timeSpanDatas[0];

        if (firstItem) {
          setSelectedItemSidebar(firstItem);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(true);
    }
  };

  const handleCancel = () => {
    if (selectedItemSidebar) {
      reset({
        timeSpanName: selectedItemSidebar.timeSpanName,
        comments: selectedItemSidebar.comments,
      });
    } else {
      reset({
        timeSpanName: "",
        comments: null,
      });
    }
    setMode("view");
  };

  return (
    <div className="p-2">
      <h1 className="font-semibold">Detail</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Time Span Name */}
        <div className="grid grid-cols-[auto_200px] gap-x-2 mb-2">
          <Label className="text-sm text-right">
            <span className="text-red-500">*</span>Time Span Name
          </Label>
          <div>
            <Input
              className="w-[200px] h-[30px]"
              {...register("timeSpanName")}
              disabled={mode === "view"}
            />
            {errors.timeSpanName && (
              <p className="text-sm text-red-500">
                {errors.timeSpanName.message}
              </p>
            )}
          </div>
        </div>

        {/* Remarks */}
        <div className="grid grid-cols-[auto_200px] gap-x-2 mb-2">
          <Label className="text-sm text-right">Remarks</Label>
          <div>
            <Input
              className="w-[200px] h-[30px]"
              {...register("comments")}
              disabled={mode === "view"}
            />
            {errors.comments && (
              <p className="text-sm text-red-500">{errors.comments.message}</p>
            )}
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
      />
    </div>
  );
};

export default TimeSpanSidebarDetail;
