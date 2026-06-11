import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useLifeCycle } from "../hooks/context";
import { useForm } from "react-hook-form";
import {
  LifeCycleTypeSchema,
  LifeCycleType,
  initFormLifeCycleType,
} from "../types/zodTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";

const API_URL = apiConfigRef.ref;

const PopUpAddLifeCycle = () => {
  const { addDialog, setAddDialog, setRefreshSidebar } = useLifeCycle();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { PostData } = useCallApi();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LifeCycleType>({
    resolver: zodResolver(LifeCycleTypeSchema),
    defaultValues: initFormLifeCycleType(),
  });

  useEffect(() => {
    reset();
  }, [addDialog]);

  const onSubmit = async (data: LifeCycleType) => {
    try {
      const resp = await PostData(
        `${API_URL}/api/lifecycle-type/add-lifecycle-type`,
        data
      );
      if (resp?.status) {
        toast.success(resp.message);
        setAddDialog(false);
        setRefreshSidebar((prev) => prev + 1);
        return;
      }
      return toast.error(resp?.message);
    } catch (error) {
      return toast.error(
        `Failed to add data, connection issue with the server`
      );
    }
  };

  return (
    <DialogWrapper
      isOpen={addDialog}
      handleDialog={setAddDialog}
      title="Add Life Cycle"
      size={{ width: "sm" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-2 pt-2"
      >
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-2">
            <Label className="w-32">
              LifeCycle Name <span className="text-red-500">*</span>
            </Label>
            <Input
              className="flex-1"
              size={"sm"}
              {...register("lifecycleTypeName")}
              disabled={isLoading}
            />
          </div>
          {errors.lifecycleTypeName && (
            <div className="text-red-500 text-sm text-end">
              {errors.lifecycleTypeName.message}
            </div>
          )}
        </div>
        {/* <div className="flex flex-row items-center gap-2">
          <Label className="w-32">Comments</Label>
          <Input
            className="flex-1"
            size={"sm"}
            {...register("comments")}
            disabled={isLoading}
          />
        </div> */}
        <div className="flex flex-row items-center gap-2 justify-end">
          <Button size={"sm"} type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Submit"}
          </Button>
          <Button
            size={"sm"}
            variant={"outline"}
            type="button"
            onClick={() => {
              setAddDialog(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </DialogWrapper>
  );
};

export default PopUpAddLifeCycle;
