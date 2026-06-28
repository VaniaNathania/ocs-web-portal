import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import * as Yup from "yup";
import { useFormik } from "formik";
import { KeenIcon } from "@/components";
import { toAbsoluteUrl } from "@/utils";
import { useAuthContext } from "@/auth";
import { Alert } from "@/components";
import moment from "moment";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const loginSchema = Yup.object().shape({
  userName: Yup.string().required("Username is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
  remember: Yup.boolean(),
});

const initialValues = {
  userName: "",
  password: "",
  application: "edc",
  remember: false,
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);

      try {

        await login(values.userName, values.password);

        if (values.remember) {
          localStorage.setItem("userName", values.userName);
        } else {
          localStorage.removeItem("userName");
        }

        navigate(from, { replace: true });
      } catch (error: any) {
        console.log("ini error page login formik", error);

        if (error.response && error.response.data) {
          setStatus(error.response.data.message);
        } else {
          setStatus("The login details are incorrect");
        }

        setSubmitting(false);
      }
      setLoading(false);
    },
  });

  useEffect(() => {
    
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="card max-w-[390px] border-0 shadow-none w-full">
      <Helmet>
        <title>OCS Portal | Sign In</title>
      </Helmet>

      <form
        className="card-body flex flex-col gap-5 p-5"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="flex align-center justify-center text-center mb-2.5">
          <img
            className="h-[50px] max-w-none mb-2 text-center"
            alt=""
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-center gap-3items-center">
            <h3
              className="text-center font-semibold text-gray-900"
              style={{ fontSize: "36px" }}
            >
              OCS Portal Web
            </h3>
          </div>
        </div>
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900 ps-2.5">Username</label>
          <label className="input">
            <input
              placeholder="Enter Username"
              autoComplete="off"
              {...formik.getFieldProps("userName")}
             
              className={clsx("form-control", {
                "is-invalid": formik.touched.userName && formik.errors.userName,
              })}
            />
          </label>
          {formik.touched.userName && formik.errors.userName && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.userName}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <label className="form-label text-gray-900 ps-2.5">Password</label>
          </div>
          <label className="input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              autoComplete="off"
              {...formik.getFieldProps("password")}
              className={clsx("form-control", {
                "is-invalid": formik.touched.password && formik.errors.password,
              })}
            />
            <button
              type="button"
              className="btn btn-icon"
              onClick={togglePassword}
            >
              <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", { hidden: showPassword })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>
        

        <Button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? "Please wait..." : "Sign In"}
        </Button>
        <div>
          <p
            className="text-2sm"
            style={{ fontSize: "12px", letterSpacing: 0.25 }}
          >
            
          </p>
        </div>
      </form>
    </div>
  );
};

export { Login };
