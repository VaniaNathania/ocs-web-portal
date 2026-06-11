import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompList } from "../../hook/useComp";
import { useForm } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { KeenIcon } from "@/components";
import { useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRole } from "@/config/api.config";
import { toast } from "sonner";
import IconSelector from "../../block/IconSelector";

type FormValues = {
  dirName: string;
  iconUrl: string;
  dirId: number;
  parentId: number;
  spId: 0;
  comments: string;
};

const KeenIconItems = [
  { icon: "plus" },
  { icon: "trash" },
  { icon: "filter" },

  // Navigation & Direction
  { icon: "arrow-right" },
  { icon: "arrow-left" },

  // Dots / Menu
  { icon: "dots-horizontal" },
  { icon: "dots-vertical" },
  { icon: "menu" },
  { icon: "more-2" },
  { icon: "price-tag" },
  { icon: "user-edit" },
  { icon: "discount" },
  { icon: "handcart" },
  { icon: "shop" },
  { icon: "wrench" },
  { icon: "setting" },
  { icon: "setting-2" },
  { icon: "setting-3" },
  { icon: "bill" },

  // Time & Date
  { icon: "time" },
  { icon: "calendar" },
  { icon: "timer" },

  // Location
  { icon: "map" },

  // System
  { icon: "question" },
];

const API_URL = apiConfigRole.role;

export const NewDirContent = () => {
  const {
    selectedRow,
    setOnConfirm,
    setDesc,
    setShowConfirm,
    setShowMenuSelector,
  } = useCompList();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>();

  const { PostData } = useCallApi();

  const iconValue = watch("iconUrl"); // 👈 Watch selected icon
  const [open, setOpen] = useState(false);

  const handleSave = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        parentId: selectedRow?.id === 0 ? null : selectedRow?.id,
      };

      //  console.log("Payload to API:", payload);
      const resp = await PostData(`${API_URL}/api/dirs/add-dir`, payload);

      if (resp?.status) {
        return toast.success(resp.message);
      }
      return toast.error(resp?.message);
    } catch (error) {
      toast.error("Error adding new directory");
    } finally {
      setShowMenuSelector(false);
      setShowConfirm(false);
    }
  };

  const handleConfirmation = (data: FormValues) => {
    setDesc(`Are you sure to add ${data.dirName} as a new directory?`);
    setOnConfirm(() => () => handleSave(data));
    setShowConfirm(true);
  };

  return (
    <form
      onSubmit={handleSubmit(handleConfirmation)}
      className="space-y-2 mt-5"
    >
      {/* Parent Directory */}
      <div className="flex flex-col flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700">
          Parent Directory<span className="text-red-500 ml-1">*</span>
        </label>
        <Input disabled value={selectedRow?.name} className="pr-10" />
      </div>

      {/* Directory Name */}
      <div className="flex flex-col flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700">
          Directory Name<span className="text-red-500 ml-1">*</span>
        </label>
        <Input
          placeholder="Enter Directory Name"
          {...register("dirName", { required: "Directory name is required" })}
        />
        {errors.dirName && (
          <p className="text-red-500 text-xs mt-1">{errors.dirName.message}</p>
        )}
      </div>

      {/* Icon URL Selector */}
      <div className="flex flex-col flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700">
          Icon Url<span className="text-red-500 ml-1">*</span>
        </label>

        <IconSelector watch={watch} setValue={setValue} register={register} />

        {errors.iconUrl && (
          <p className="text-red-500 text-xs mt-1">{errors.iconUrl.message}</p>
        )}
      </div>

      {/* Save Button */}
      <div className="w-full flex justify-end">
        <Button type="submit" className="px-4 py-2 bg-blue-500 text-white">
          Add
        </Button>
      </div>
    </form>
  );
};
