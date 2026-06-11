import axios from "axios";
import { apiConfigLog } from "@/config/api.config";
import { toast } from "sonner";
import { UserLoginData } from "@/auth/models/interfaces";
import * as authHelper from "@/auth/_helpers";

interface SaveLogsParams {
  module: string;
  description: string;
  action: string;
}

const API_URL_LOG = apiConfigLog;

const getCurrentTimeJakarta = () => {
  const jakartaTime = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const [date, time] = jakartaTime.split(" ");
  const [day, month, year] = date.split("/");

  return `${year}-${month}-${day} ${time}`;
};

export async function doSaveLogActivity(
  payload: SaveLogsParams,
): Promise<ActionResponseTypes> {
  return { status: true, message: "" };
}

export const addLogActivity = async (
  eventType: string,
  eventCode: string,
  comments: string,
  url: string,
) => {
  try {
    const user = localStorage.getItem(authHelper.AUTH_LOCAL_STORAGE_KEY) ?? "";
    // console.log("user di log", user);

    if (user === "") {
      return;
    } else {
      const userData: UserLoginData = JSON.parse(user);

      const userId = JSON.parse(user).user.id;

      if (!userId) {
        return localStorage.removeItem(
          "ocs-portal-web-telkomcel-auth-v1=9.1.1",
        );
      }

      if (
        [
          "NEXT",
          "PREVIOUS",
          "ADD",
          "EDIT",
          "DELETE",
          "CANCEL",
          "COPY",
          "CONFIRM",
          "QUERY",
          "RESET",
        ].includes(eventCode)
      )
        return;
      const payload = {
        eventType: eventType,
        eventCode: eventCode,
        comments: comments + (url ? ` on ${url}` : ""),
        url: url[0] === "/" ? url : `/${url}`,
        ip: "-",
        eventSrc: "ff",
        createdBy: JSON.parse(user).user.id,
        isSuccess: comments.toLowerCase().includes("success") ? 1 : 0,
        partId: 1,
      };

      const resp = await axios.post(
        `${API_URL_LOG}/api/log-management/addLog`,
        payload,
      );
      return;
    }
  } catch (error: any) {
    const { response } = error;
    console.log(error);

    throw toast.error("failed to save log");
  }
  // finally {
  //   debugger;
  // }
};
