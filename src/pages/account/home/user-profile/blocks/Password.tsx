import {
  useState,
  useContext,
  useEffect,
  useCallback,
  MouseEvent,
} from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import { KeenIcon } from "@/components";
import clsx from "clsx";
import { EditPassForm } from "@/pages/main-menu/user-management/models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigRole } from "@/config/api.config";
import { UserLoginData } from "@/auth/models/interfaces";

const API_ROLE = apiConfigRole.role;

const defaultForm: EditPassForm = {
  confPwd: "",
  newPwd: "",
  oldPwd: "",
  userCode: "",
  userName: "",
};

type PasswordType = "password" | "retype_password" | "current_password";
const Password = () => {
  // const { setPassword } = useContext(AccountUserProfileContext);
  const { userData, saveAuth } = useAuthContext();
  const { PutData } = useCallApi();

  const [form, setForm] = useState<EditPassForm>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messagePassword, setMessagePassword] = useState(true);
  const [showPassword, setShowPassword] = useState({
    current_password: false,
    password: false,
    retype_password: false,
  });

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string) => {
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasCapitalLetter = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasSpecialChar && hasCapitalLetter && hasNumber;
  };

  const onSubmit = async (data: EditPassForm) => {
    try {
      const tempUserData: UserLoginData | undefined = userData();

      if (!tempUserData) return;
      const payload = {
        userName: tempUserData?.user.name,
        userCode: tempUserData?.user.code,
        newPwd: data.newPwd,
        oldPwd: data.oldPwd,
      };

      //  console.log("Form submitted:", payload);

      const response = await PutData(
        `${API_ROLE}/api/prod/users/${tempUserData?.user.id}/pwd`,
        payload,
      );

      if (response?.status) {
        toast.success("Password updated successfully!");
        saveAuth({ ...tempUserData, forceLogin: "" });
        // setShowEditPass(false);
        //  console.log("✅ Password updated successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to update password. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error updating password:", error);
      throw error; // optional
    }
  };

  useEffect(() => {
    const passwordsMatch = form.newPwd === form.confPwd;
    const isPasswordValid = validatePassword(form.newPwd);
    setMessagePassword(passwordsMatch && isPasswordValid);

    const errors: string[] = [];
    if (form.newPwd) {
      if (!/[A-Z]/.test(form.newPwd)) {
        errors.push("Password must contain at least one capital letter");
      }
      if (!/[0-9]/.test(form.newPwd)) {
        errors.push("Password must contain at least one number");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.newPwd)) {
        errors.push("Password must contain at least one special character");
      }
      if (form.newPwd !== form.confPwd) {
        errors.push("Passwords do not match");
      }
    }
    setPasswordErrors(errors);
  }, [form.newPwd, form.confPwd]);

  const handleResetPassword = useCallback(async () => {
    if (!messagePassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);

    try {
      onSubmit(form);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while resetting the password.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setForm(defaultForm);
    }
  }, [form, messagePassword, userData]);

  const isButtonDisabled =
    isSubmitting || !form.newPwd || !form.confPwd || !messagePassword;

  const togglePassword = useCallback(
    (event: MouseEvent<HTMLButtonElement>, key: string) => {
      event.preventDefault();
      setShowPassword((prev) => ({
        ...prev,
        [key]: !prev[key as PasswordType],
      }));
    },
    [],
  );

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="password_settings">
        <h3 className="card-title">Password</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <label className="form-label max-w-56">Current Password</label>
          <div className="input">
            <input
              type={showPassword.current_password ? "text" : "password"}
              className="form-control"
              placeholder="Current password"
              value={form.oldPwd}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, oldPwd: e.target.value }))
              }
              disabled={isSubmitting}
            />
            <button
              className="btn btn-icon"
              onClick={(e) => togglePassword(e, "current_password")}
            >
              <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", {
                  hidden: showPassword.current_password,
                })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", {
                  hidden: !showPassword.current_password,
                })}
              />
            </button>
          </div>
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <label className="form-label max-w-56">New Password</label>
          <div className="input">
            <input
              className="form-control"
              placeholder="New password"
              value={form.newPwd}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, newPwd: e.target.value }))
              }
              disabled={isSubmitting}
              type={showPassword.password ? "text" : "password"}
            />
            <button
              className="btn btn-icon"
              onClick={(e) => togglePassword(e, "password")}
            >
              <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", {
                  hidden: showPassword.password,
                })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", {
                  hidden: !showPassword.password,
                })}
              />
            </button>
          </div>
        </div>
        <div className="mb-2.5">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">Confirm New Password</label>
            <div className="input">
              <input
                type={showPassword.retype_password ? "text" : "password"}
                className="form-control"
                placeholder="Confirm new password"
                value={form.confPwd}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, confPwd: e.target.value }))
                }
                disabled={isSubmitting}
              />
              <button
                className="btn btn-icon"
                onClick={(e) => togglePassword(e, "retype_password")}
              >
                <KeenIcon
                  icon="eye"
                  className={clsx("text-gray-500", {
                    hidden: showPassword.retype_password,
                  })}
                />
                <KeenIcon
                  icon="eye-slash"
                  className={clsx("text-gray-500", {
                    hidden: !showPassword.retype_password,
                  })}
                />
              </button>
            </div>
          </div>
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56 text-white">
              Confirm New Password
            </label>
            {passwordErrors.length > 0 && (
              <div className="text-xs text-red-500 mt-1 ms-3">
                {passwordErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="btn btn-primary"
            onClick={handleResetPassword}
            disabled={isButtonDisabled}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export { Password };
