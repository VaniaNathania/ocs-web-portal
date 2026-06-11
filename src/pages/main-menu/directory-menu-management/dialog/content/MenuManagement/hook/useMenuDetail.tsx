import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { useDirMenuManagement } from "./useDirMenuManagement";
import { useCompList } from "@/pages/main-menu/directory-menu-management/hook/useComp";
import { apiConfigRole } from "@/config/api.config";
import { PrivData } from "./DirMenuManagementProvider";

const API_URL = apiConfigRole.role;

export const useMenuDetail = () => {
  const { selectedRow } = useDirMenuManagement();
  const { PostData, PutData } = useCallApi();
  const { setOnConfirm, setDesc, setShowConfirm, setShowMenuManagement } =
    useCompList();

  const [isFirstClick, setIsFirstClick] = useState(true);
  const [isCreate, setIsCreate] = useState(false);
  const [isDisable, setIsDisable] = useState(false);

  const baseData: PrivData = {
    ...selectedRow,
    privId: selectedRow?.privId ?? 0,
    privType: selectedRow?.privType ?? "M",
    privName: selectedRow?.privName ?? "",
    id: selectedRow?.id ?? 0,
    type: selectedRow?.type ?? "1",
    name: selectedRow?.name ?? "",
    comments: selectedRow?.comments ?? "",
    url: selectedRow?.url ?? "",
    state: selectedRow?.state ?? "A",
    stateDate: selectedRow?.stateDate ?? "",
    privCode: selectedRow?.privCode ?? "",
    privEl: selectedRow?.privEl ?? "",
    iconUrl: selectedRow?.iconUrl ?? "",
    hasChildren: false,
    // autoOpenMenu: selectedRow?.autoOpenMenu ?? "N",
    level: selectedRow?.level ?? 0,
  };

  const emptyData: PrivData = {
    ...baseData,
    privName: "",
    id: 0,
    name: "",
    comments: "",
    url: "",
    privCode: "",
    privEl: "",
    privType: "",
    iconUrl: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrivData>({
    defaultValues: baseData,
  });

  useEffect(() => {
    reset(baseData);
    setIsFirstClick(true);
    setIsDisable(true);
  }, [selectedRow]);

  const onSubmit = (formData: PrivData) => {
    setShowConfirm(true);
    if (isCreate) {
      setOnConfirm(() => () => handleCreate(formData));
      setDesc("Are you sure to create a new Menu?");
    } else {
      setOnConfirm(() => () => handleEdit(formData));
      setDesc("Are you sure to edit this Menu?");
    }
  };

  const handleCreate = async (formData: PrivData) => {
    try {
      //  console.log("create with data ", formData);

      const payload = {
        // menuId: 0,
        menuName: formData.privName,
        menuType: formData.privType,
        iconUrl: formData.iconUrl,
        priv: {
          // appId: 0,
          // privId: 0,
          privType: "M",
          privCode: formData.privCode,
          privName: formData.privName,
          privEl: formData.privEl,
          url: formData.url,
          comments: formData.comments,
          // isAuthorized: "string",
          // isHold: "string",
          spId: 0,
        },
        spId: 0,
        specialCondition: formData.specialCondition,
      };
      const resp = await PostData(`${API_URL}/api/dirs/add-menu`, payload);

      if (resp?.status) {
        // setShowMenuManagement(false);
        resetBtn();
        resetForm();
        return toast.success(resp.message);
      }
      toast.error(resp?.message);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    } finally {
      setShowConfirm(false);
      // fetchMenu();
    }
  };

  const handleEdit = async (formData: PrivData) => {
    try {
      //  console.log("edit with data ", formData);

      const payload = {
        menuId: formData.privId,
        menuName: formData.privName,
        menuType: formData.privType,
        iconUrl: formData.iconUrl,
        priv: {
          // appId: 0,
          privId: formData.privId,
          privType: formData.type,
          privCode: formData.privCode,
          privName: formData.privName,
          privEl: formData.privEl,
          url: formData.url,
          comments: formData.comments,
          // isAuthorized: "string",
          // isHold: "string",
          spId: 0,
        },
        spId: 0,
        specialCondition: formData.specialCondition,
      };
      const resp = await PutData(`${API_URL}/api/dirs/mod-menu`, payload);

      if (resp?.status) {
        // setShowMenuManagement(false);

        return toast.success(resp.message);
      }
      toast.error(resp?.message);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    } finally {
      setShowConfirm(false);
      resetBtn();
      // fetchMenu();
      // resetForm();
    }
  };

  const resetBtn = () => {
    setIsDisable(true);
    setIsFirstClick(true);
    setIsCreate(false);
  };

  const resetForm = () => {
    reset(emptyData);
  };

  const onButtonLeft = () => {
    if (isFirstClick) {
      setIsCreate(true);
      setIsDisable(false);
      setIsFirstClick(false);
      resetForm();
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const onButtonRight = () => {
    if (isFirstClick) {
      setIsCreate(false);
      setIsDisable(false);
      setIsFirstClick(false);
    } else {
      // resetForm();
      reset(baseData);
      resetBtn();
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    onSubmit,
    onButtonLeft,
    onButtonRight,
    isFirstClick,
    isCreate,
    isDisable,
  };
};
