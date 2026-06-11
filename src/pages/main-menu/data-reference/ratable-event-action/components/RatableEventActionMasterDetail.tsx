import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRatableEventActionContext } from "../hooks/useRatableEventActionContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  initialFormMaster,
  RatableEventActionMasterForm,
  RatableEventActionMasterTypeSchema,
} from "../schema/ratableEventAction.schema";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { RatableEventActionMasterProps } from "../hooks/RatableEventActionContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

type mode = "view" | "new" | "edit";

const API_URL_REF = apiConfigRef.ref;

const RatableEventActionMasterDetail = () => {
  const { PostData, PutData, DeleteData } = useCallApi();
  const {
    selectedItemMaster,
    setSelectedItemMaster,
    reActionDatas,
    fetchReAction,
    menuPrivAccess,
  } = useRatableEventActionContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<mode>("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RatableEventActionMasterForm>({
    resolver: zodResolver(RatableEventActionMasterTypeSchema),
    defaultValues: initialFormMaster(),
  });

  //  console.log(errors, "errors master");

  useEffect(() => {
    const firstItem = reActionDatas[0];
    if (!selectedItemMaster) {
      setSelectedItemMaster(firstItem);
      reset({
        reActionName: firstItem?.reActionName,
        reActionCode: firstItem?.reActionCode,
        comments: firstItem?.comments ?? null,
      });
    } else {
      reset({
        reActionName: selectedItemMaster.reActionName,
        reActionCode: selectedItemMaster.reActionCode,
        comments: selectedItemMaster.comments ?? null,
      });
      setMode("view");
    }
  }, [selectedItemMaster, reActionDatas, reset]);

  const handleNew = () => {
    reset(initialFormMaster());
    setMode("new");
  };

  const onSubmit = async (data: RatableEventActionMasterForm) => {
    setIsSubmitting(true);
    if (mode === "new") {
      try {
        const payloadNew = {
          ...data,
          state: "A",
          spId: 0,
        };
        const response = await PostData(
          `${API_URL_REF}/api/ratable-event-action/add-re-action`,
          payloadNew,
        );

        if (response?.status) {
          toast.success("Success");
          setMode("view");
          fetchReAction();
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
          reActionId: selectedItemMaster?.reActionId,
          state: "A",
          spId: 0,
        };
        const response = await PutData(
          `${API_URL_REF}/api/ratable-event-action/mod-re-action`,
          payloadMod,
        );
        if (response?.status) {
          toast.success("Success");
          setMode("view");
          const newData = await fetchReAction();

          const lastItem = newData?.find(
            (item: RatableEventActionMasterProps) =>
              item.reActionName === data.reActionName,
          );

          if (lastItem) {
            setSelectedItemMaster(lastItem);
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
    if (selectedItemMaster) {
      reset({
        reActionName: selectedItemMaster.reActionName,
        reActionCode: selectedItemMaster.reActionCode,
        comments: selectedItemMaster.comments,
        spId: selectedItemMaster.spId,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    const reActionId = selectedItemMaster?.reActionId;
    setIsSubmitting(true);
    if (!reActionId) return;
    try {
      const response = await DeleteData(
        `${API_URL_REF}/api/ratable-event-action/del-re-action?reActionId=${reActionId}`,
        reActionId,
      );
      if (response?.status) {
        toast.success("Success");
        setMode("view");
        fetchReAction();
        setIsDeleteOpen(false);

        const firstItem = reActionDatas[0];

        if (firstItem) {
          setSelectedItemMaster(firstItem);
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
    if (selectedItemMaster) {
      reset({
        reActionName: selectedItemMaster.reActionName,
        reActionCode: selectedItemMaster.reActionCode,
        comments: selectedItemMaster.comments,
        spId: selectedItemMaster.spId,
      });
    } else {
      reset(initialFormMaster());
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
            <span className="text-red-500">*</span>Action Name
          </Label>
          <div>
            <Input
              className="w-[200px] h-[30px]"
              {...register("reActionName")}
              disabled={mode === "view"}
            />
            {errors.reActionName && (
              <p className="text-sm text-red-500">
                {errors.reActionName.message}
              </p>
            )}
          </div>
        </div>

        {/* Time Span Name */}
        <div className="grid grid-cols-[auto_200px] gap-x-2 mb-2">
          <Label className="text-sm text-right">
            <span className="text-red-500">*</span>Action Code
          </Label>
          <div>
            <Input
              className="w-[200px] h-[30px]"
              {...register("reActionCode")}
              disabled={mode === "view"}
            />
            {errors.reActionCode && (
              <p className="text-sm text-red-500">
                {errors.reActionCode.message}
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
              <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
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
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </AccessWrapper>
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

export default RatableEventActionMasterDetail;
