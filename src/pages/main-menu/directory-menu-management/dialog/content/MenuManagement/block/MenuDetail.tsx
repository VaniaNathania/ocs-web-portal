import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMenuDetail } from "../hook/useMenuDetail";
import IconSelector from "@/pages/main-menu/directory-menu-management/block/IconSelector";
import { useEffect } from "react";

export const MenuDetail = () => {
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    errors,
    onSubmit,
    onButtonLeft,
    onButtonRight,
    isFirstClick,
    isCreate,
    isDisable,
  } = useMenuDetail();

  useEffect(() => {
    //  console.log(errors);
  }, [register]);

  return (
    <div className="flex flex-col bg-white space-y-5">
      <div className="text-lg font-semibold">Detail</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {/* Menu Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Menu Name <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              {...register("privName", { required: "Menu Name is required" })}
              type="text"
              placeholder="Enter Menu Name"
              disabled={isDisable}
              autoComplete="off"
            />
            {errors.privName && (
              <p className="text-red-500 text-sm">{errors.privName.message}</p>
            )}
          </div>

          {/* Menu URL */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Menu URL <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              {...register("url", { required: "Menu URL is required" })}
              placeholder="modules/.../views/..."
              disabled={isDisable}
              autoComplete="off"
            />
            {errors.url && (
              <p className="text-red-500 text-sm">{errors.url.message}</p>
            )}
          </div>

          {/* Menu Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Menu Type <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              {...register("privType", { required: "Menu Type is required" })}
              disabled={isDisable}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">--- Please Select ---</option>
              <option value="S">Single Page</option>
              <option value="M">Menu</option>
            </select>
            {errors.privType && (
              <p className="text-red-500 text-sm">{errors.privType.message}</p>
            )}
          </div>
          {/* Privilege Code */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Privilege Code <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("privCode", {
                required: "Privilege Code is required",
              })}
              placeholder="Enter Privilege Code"
              disabled={isDisable}
              autoComplete="off"
            />
            {errors.privCode && (
              <p className="text-red-500 text-sm">{errors.privCode.message}</p>
            )}
          </div>

          {/* Priv Element */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Priv Element
            </label>
            <Input
              {...register("privEl")}
              placeholder="/roles|/portals"
              disabled={isDisable}
              autoComplete="off"
            />
          </div>

          {/* Event Type */}
          {/* <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Event Type
            </label>
            <select
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md"
              disabled={isDisable}
            >
              <option value="">--- Please Select ---</option>
              <option value="click">Click</option>
              <option value="hover">Hover</option>
            </select>
          </div> */}
          {/* Remarks */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Remarks</label>
            <Input
              {...register("comments")}
              placeholder="Remarks..."
              disabled={isDisable}
              autoComplete="off"
            />
          </div>

          {/* Special Condition */}
          {/* <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Special Condition
            </label>
            <Input
              {...register("specialCondition")}
              placeholder="Enter Special Condition"
              disabled={isDisable}
              autoComplete="off"
            />
          </div> */}

          {/* Icon Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Icon Url
            </label>
            <IconSelector
              register={register}
              setValue={setValue}
              watch={watch}
              disable={isDisable}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex justify-end space-x-5 mt-5">
          <Button type="button" onClick={onButtonLeft} variant="default">
            {isFirstClick ? "New" : "Submit"}
          </Button>
          <Button type="button" variant="outline" onClick={onButtonRight}>
            {isFirstClick ? "Edit" : "Cancel"}
          </Button>
        </div>
      </form>
    </div>
  );
};
