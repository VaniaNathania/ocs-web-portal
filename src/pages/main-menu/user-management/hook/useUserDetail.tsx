import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { useUserManagement } from "../hook/useUserManagemet";
import { UserMData } from "../hook/UserManagementProvider";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

export const useUserDetail = () => {
  const { selectedRow, fetchUser } = useUserManagement();
  const { PostData, PutData } = useCallApi();

  const [isFirstClick, setIsFirstClick] = useState(true);
  const [isCreate, setIsCreate] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [onConfirm, setOnConfirm] = useState<() => void>();
  const [desc, setDesc] = useState<string>();

  const baseData: UserMData = {
    ...selectedRow,
    userId: selectedRow?.userId ?? null,
    userName: selectedRow?.userName ?? "",
    userCode: selectedRow?.userCode ?? "",
    pwd: selectedRow?.pwd ?? "",
    userEffDate: selectedRow?.userEffDate ?? "",
    userExpDate: selectedRow?.userExpDate ?? "",
    createdDate: selectedRow?.createdDate ?? null,
    lastLoginDate: selectedRow?.lastLoginDate ?? null,
    state: selectedRow?.state ?? "A",
    stateDate: selectedRow?.stateDate ?? "",
    isLocked: selectedRow?.isLocked ?? "N",
    loginFail: selectedRow?.loginFail ?? 0,
    unlockDate: selectedRow?.unlockDate ?? null,
    portalId: selectedRow?.portalId ?? 0,
    portalName: selectedRow?.portalName ?? "",
    updateDate: selectedRow?.updateDate ?? null,
    bsnlPms: selectedRow?.bsnlPms ?? false,
    nullAble: selectedRow?.nullAble ?? false,
    exist: selectedRow?.exist ?? false,
    userType: selectedRow?.userType ?? "",
    email: selectedRow?.email ?? "",
    phone: selectedRow?.phone ?? "",
    address: selectedRow?.address ?? "",
    memo: selectedRow?.memo ?? "",
    pwdExpDate: selectedRow?.pwdExpDate ?? "",
    isEffectiveNow: selectedRow?.isEffectiveNow ?? "",
    orderFields: selectedRow?.orderFields ?? "",
    openId: selectedRow?.openId ?? "",
    alias: selectedRow?.alias ?? "",
    securityQuestionId: selectedRow?.securityQuestionId ?? 0,
    securityAnswer: selectedRow?.securityAnswer ?? "",
    thumbnailUri: selectedRow?.thumbnailUri ?? "",
    extAttr: selectedRow?.extAttr ?? "",
    stateNotEquals: selectedRow?.stateNotEquals ?? "",
    userTypeName: selectedRow?.userTypeName ?? "",
    userStateName: selectedRow?.userStateName ?? "",
    roleNameListStr: selectedRow?.roleNameListStr ?? "",
    roleIdListStr: selectedRow?.roleIdListStr ?? "",
    srcId: selectedRow?.srcId ?? 0,
    roleId: selectedRow?.roleId ?? 0,
    loginIp: selectedRow?.loginIp ?? "",
    passwordExist: selectedRow?.passwordExist ?? false,
    createdId: selectedRow?.createdId ?? 0,
    headImg: selectedRow?.headImg ?? "",
    circle: selectedRow?.circle ?? "",
    orgId: selectedRow?.orgId ?? 0,
    circleName: selectedRow?.circleName ?? "",
    zoneName: selectedRow?.zoneName ?? "",
  };

  const emptyData: UserMData = {
    ...baseData,
    userId: null,
    userName: "",
    userCode: "",
    pwd: "",
    userEffDate: "",
    userExpDate: "",
    email: "",
    phone: "",
    address: "",
    memo: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserMData>({
    defaultValues: baseData,
  });

  useEffect(() => {
    reset(baseData);
    setIsFirstClick(true);
    setIsDisable(true);
  }, [selectedRow]);

  const onSubmit = (formData: UserMData) => {
    const formatDateTime = (value?: string) => {
      if (!value) return null;
      const date = new Date(value);
      //       const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // adjust to local
      const local = new Date(date.getTime()); // adjust to local
      const yyyy = local.getFullYear();
      const mm = String(local.getMonth() + 1).padStart(2, "0");
      const dd = String(local.getDate()).padStart(2, "0");
      const hh = String(local.getHours()).padStart(2, "0");
      const mi = String(local.getMinutes()).padStart(2, "0");
      const ss = String(local.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    };

    const payload: UserMData = {
      ...formData,
      userEffDate: formatDateTime(formData.userEffDate) ?? "",
      userExpDate: formatDateTime(formData.userExpDate) ?? "",
    };

    setShowDialog(true);
    if (isCreate) {
      setOnConfirm(() => () => handleCreate(payload));
      setDesc("Are you sure to create a new user?");
    } else {
      setOnConfirm(() => () => handleEdit(payload));
      setDesc("Are you sure to edit this user?");
    }
  };

  const handleCreate = async (formData: UserMData) => {
    try {
      const response = await PostData(
        `${API_ROLE}/api/prod/users/add`,
        formData,
      );
      if (response?.status) {
        toast.success("User created successfully!");
      } else {
        toast.error(response?.message || "Failed to create user.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    } finally {
      setShowDialog(false);
      resetBtn();
      fetchUser();
      resetForm();
    }
  };

  const handleEdit = async (formData: UserMData) => {
    try {
      const response = await PutData(
        `${API_ROLE}/api/prod/users/edit`,
        formData,
      );
      if (response?.status) {
        toast.success("User updated successfully!");
      } else {
        toast.error(response?.message || "Failed to update user.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    } finally {
      setShowDialog(false);
      resetBtn();
      fetchUser();
      resetForm();
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
      resetForm();
      resetBtn();
    }
  };

  const handleEffectiveNow = (checked: boolean) => {
    if (checked) {
      const now = new Date();
      // Adjust for timezone offset
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const formatted = local.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm (local)
      setValue("userEffDate", formatted, { shouldValidate: true });
    } else {
      setValue("userEffDate", "", { shouldValidate: true });
    }
  };

  const isNow = () => {
    const effDate = watch("userEffDate");
    if (!effDate) return false;

    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const formattedNow = local.toISOString().slice(0, 16);

    return effDate === formattedNow;
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
    showDialog,
    setShowDialog,
    onConfirm,
    desc,
    isNow,
    handleEffectiveNow,
  };
};
