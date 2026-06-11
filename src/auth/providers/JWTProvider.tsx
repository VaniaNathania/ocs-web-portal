/* eslint-disable no-unused-vars */
import axios, { AxiosResponse } from "axios";
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState,
} from "react";

import * as authHelper from "../_helpers";
import { type AuthModel, type UserModel } from "@/auth";
import { apiConfig, apiConfigRole } from "@/config/api.config";
import { addLogActivity, doSaveLogActivity } from "@/actions/GlobalActions";
import { PricePlanDetail, PricePlaneProps } from "@/pages/main-menu/types";
import { useRoleCheck } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useCallApi } from "@/hooks";
import { getData } from "@/utils";
import { UserLoginData } from "../models/interfaces";

const API_URL = apiConfig.service_user;
const API_URL_LOGIN = apiConfigRole.login;

export const LOGIN_URL = `${API_URL_LOGIN}/auth/login`;
export const FORGOT_PASSWORD_URL = `${API_URL}/reset_password`;
export const RESET_PASSWORD_URL = `${API_URL}/update_password`;
export const GET_USER_URL = `${API_URL}/user/detail`;

interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  login: (email: string, password: string) => Promise<void>;
  requestPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (
    token: string,
    password: string,
    password_confirmation: string,
  ) => Promise<void>;
  getUser: () => Promise<AxiosResponse<any> | {}>;
  userData: () => UserLoginData | undefined;
  logout: () => void;
  verify: () => Promise<void>;
  selectedPricePlan: PricePlaneProps | null;
  setSelectedPricePlan: (value: PricePlaneProps | null) => void;
  pricePlanDetail: PricePlanDetail | null;
  setPricePlandetail: (value: PricePlanDetail | null) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  const [selectedPricePlan, setSelectedPricePlan] =
    useState<PricePlaneProps | null>(null);
  const [pricePlanDetail, setPricePlandetail] =
    useState<PricePlanDetail | null>(null);

  const { isHaveMenu } = useRoleCheck();

  const isTokenExpired = (auth: AuthModel | undefined) => {
    if (!auth?.expired) return false;
    const expiredTime = new Date(auth.expired).getTime();
    return expiredTime < Date.now();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentAuth = authHelper.getAuth();
      if (isTokenExpired(currentAuth)) {
        // logout();
      }
    }, 1000 * 60);

    if (!isHaveMenu) logout();

    return () => clearInterval(interval);
  }, [auth]);

  const verify = async () => {
    if (auth) {
      // console.log("ini verify");

      // setLoading(true);
      if (isTokenExpired(auth)) {
        // console.log("token expired");

        // logout();
        // return;
      }
      try {
        const { data: user } = await getUser();

        // localStorage.setItem("user", JSON.stringify(createCacheUser));
      } catch {
        // console.log("error di verify");

        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    // console.log("ini save auth");

    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (userName: string, password: string) => {
    try {
      //  console.log("test login");

      const { data: auth } = await axios
        .post(LOGIN_URL, { userName, password })
        .then((response) => response.data);

      //  console.log("ini auth", auth);

      const dataAuth = {
        forceLogin: auth.forceLogin,
        user: {
          name: auth.username,
          id: auth.userId,
          code: auth.userCode,
        },
        token: {
          access_token: auth.token,
        },
        menus: [...auth.menus],
        jobs: auth.jobs,
      };

      saveAuth({
        ...dataAuth.token,
        forceLogin: auth.forceLogin,
        expired: auth.expired,
        user: dataAuth.user,
        menus: dataAuth.menus,
        jobs: dataAuth.jobs,
      });
      addLogActivity("login", "LOGIN_SUCCESS", `Login Success`, "/auth/login");
    } catch (error: any) {
      //  console.log("ini login error", error);
      addLogActivity(
        "login",
        "LOGIN_FAIL",
        "Invalid Credentials",
        "/auth/login",
      );

      throw error;
    }
  };

  const requestPasswordResetLink = async (email: string) => {
    await axios.put(FORGOT_PASSWORD_URL + "/" + email + "/assets/");
  };

  const changePassword = async (
    token: string,
    password: string,
    retype_password: string,
  ) => {
    await axios.put(`${RESET_PASSWORD_URL}/${token}`, {
      password,
      retype_password,
    });
  };

  const getUser = async () => {
    const _axios = {
      created_at: "2024-11-26T13:37:09.684Z",
      deleted_at: null,
      email: "abdul.rahman@shiblysolution.com",
      id: "cefacf5f-3811-46fc-9ad5-f7dba9bb9e52",
      name: "Administrator",
      nik: null,
      status: "Y",
      updated_at: "2025-03-04T16:07:30.900Z",
      username: "admin",
    };

    const user = localStorage.getItem(authHelper.AUTH_LOCAL_STORAGE_KEY) ?? "";
    const userData = JSON.parse(user);
    return { data: userData };
  };

  const userData = (): UserLoginData | undefined => {
    const user = localStorage.getItem(authHelper.AUTH_LOCAL_STORAGE_KEY) ?? "";
    if (user === "") return undefined;
    // console.log("ini user", user);

    const userData: UserLoginData = JSON.parse(user);
    if (!userData.user.id) {
      console.log("gk ada user");

      saveAuth(undefined);
      setCurrentUser(undefined);
    }
    return userData;
  };

  const logout = async () => {
    try {
      setLoading(true);
      const user = userData();

      await addLogActivity(
        "logout",
        "LOGOUT_SUCCESS",
        `${user?.user.name}`,
        "/logout",
      );

      saveAuth(undefined);
      setCurrentUser(undefined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

    // window.location.href = "auth/login";
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        requestPasswordResetLink,
        changePassword,
        getUser,
        userData,
        logout,
        verify,
        selectedPricePlan,
        setSelectedPricePlan,
        pricePlanDetail,
        setPricePlandetail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
