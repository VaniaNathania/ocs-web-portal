import { useCallback } from "react";
import axios from "axios";
import { jsonToQueryParams } from "@/utils";
import { addLogActivity } from "@/actions/GlobalActions";
import { useNavigate } from "react-router";
import { useAuthContext } from "@/auth";

const logOut = () => {
  const navigate = useNavigate();
  navigate("/auth/login");
};

const useCallApi = () => {
  const GetExport = useCallback(async (url: string, field: any, fileName: string) => {
    try {
      const response = await axios.get(url, { params: field, responseType: "blob" });

      const currentDate = new Date().toISOString().split("T")[0];

      const blob = new Blob([response.data]);

      const downloadUrl = window.URL.createObjectURL(blob);

      fileName = `${fileName}${currentDate}.xlsx`;

      const link = document.createElement("a");

      link.href = downloadUrl;

      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        status: true,
        message: "Success",
      };
    } catch (error: any) {
      const { response } = error;

      return {
        status: false,
        message: response?.data?.error ?? response?.data?.message ?? "Unknown error",
        data: null,
      };
    }
  }, []);

  
  const GetExportData = useCallback(async (url: string, param: any, fileName: string) => {
    const urlSplit = url.split("/");
    const endpoint = urlSplit.slice(3, urlSplit.length).join("/");
    try {
      url = `${url}?` + jsonToQueryParams(param);

      const currentDate = new Date().toISOString().split("T")[0];
      fileName = `${fileName}${currentDate}.xlsx`;
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // addLogActivity(
      //   "page log",
      //   "PAGE_LOG",
      //   `success export data from URL /${endpoint}`,
      //   endpoint
      // );
      return true;
    } catch (error: any) {
      // addLogActivity(
      //   "page log",
      //   "PAGE_LOG",
      //   `failed export data from URL /${endpoint}`,
      //   endpoint
      // );
      const { response } = error;

      return {
        status: false,
        message: response?.data?.error ?? response?.data?.message ?? "Unknown error",
        data: null,
      };
    }
  }, []);

  const GetData = useCallback(async (url: string, field: any) => {
    const urlSplit = url.split("/");
    const endpoint = urlSplit.slice(3, urlSplit.length).join("/");

    try {
      const response = await axios.get(url, { params: field });
      const result = response.data;

      if (result.status === 200 || (result && result.data)) {
        // addLogActivity(
        //   "page log",
        //   "PAGE_LOG",
        //   `success Get data from URL /${endpoint}`,
        //   endpoint
        // );
        return {
          status: true,
          message: "Success fetch data",
          data: result.data,
          totalRows: result.totalRows,
        };
      } else {
        // addLogActivity(
        //   "page log",
        //   "PAGE_LOG",
        //   `failed Get data from URL /${endpoint}`,
        //   endpoint
        // );
        return {
          status: false,
          message: result.message,
          data: null,
          totalRows: 0,
        };
      }
    } catch (error: any) {
      const { response } = error;
      //  console.log(response);

      if (response.data.message === "Internal Server Error: User not found" || response.data.error) logOut();
      // addLogActivity(
      //   "page log",
      //   "PAGE_LOG",
      //   `failed Get data from URL /${endpoint}`,
      //   endpoint
      // );
      return {
        status: false,
        message: response.data.error ?? response.data.message,
        data: null,
        totalRows: 0,
      };
    }
  }, []);

  const PostData = useCallback(async (url: string, field: any) => {
    const urlSplit = url.split("/");
    const endpoint = urlSplit.slice(3, urlSplit.length).join("/");
    try {
      const response = await axios.post(url, field);
      const result = response.data;

      if (result.status) {
        // addLogActivity(
        //   "page log",
        //   "PAGE_LOG",
        //   `success post data from URL /${endpoint}`,
        //   endpoint
        // );
        return { status: true, message: result.message, data: result.data };
      }
    } catch (error: any) {
      const { response } = error;
      //  console.log(response);

      // addLogActivity(
      //   "page log",
      //   "PAGE_LOG",
      //   `failed post data from URL /${endpoint}`,
      //   endpoint
      // );
      return {
        status: false,
        message: response.data.error ?? response.data.message,
        statusCode: response.status,
      };
    }
  }, []);

  const PutData = useCallback(async (url: string, field: any) => {
    const urlSplit = url.split("/");
    const endpoint = urlSplit.slice(3, urlSplit.length).join("/");
    try {
      const response = await axios.put(url, field);
      const result = response.data;

      if (result.status) {
        // addLogActivity(
        //   "page log",
        //   "PAGE_LOG",
        //   `success put data from URL /${endpoint}`,
        //   endpoint
        // );
        return { status: true, message: result.message, data: result.data };
      }
    } catch (error: any) {
      // addLogActivity(
      //   "page log",
      //   "PAGE_LOG",
      //   `failed put data from URL /${endpoint}`,
      //   endpoint
      // );
      const { response } = error;
      return {
        status: false,
        message: response.data.error ?? response.data.message,
        statusCode: response.status,
      };
    }
  }, []);

  const DeleteData = useCallback(async (url: string, field: any) => {
    const urlSplit = url.split("/");
    const endpoint = urlSplit.slice(3, urlSplit.length).join("/");
    try {
      const response = await axios.delete(url, { data: field });
      const result = response.data;

      //  console.log(response);

      //  console.log({ message: result.message, data: result.data });

      if (result.status) {
        // addLogActivity(
        //   "page log",
        //   "PAGE_LOG",
        //   `success delete data from URL /${endpoint}`,
        //   endpoint
        // );
        return { status: true, message: result.message, data: result.data };
      }
    } catch (error: any) {
      const { response } = error;
      //  console.log(response);

      // addLogActivity(
      //   "page log",
      //   "PAGE_LOG",
      //   `failed delete data from URL /${endpoint}`,
      //   endpoint
      // );
      return {
        status: false,
        message: response.data.error ?? response.data.message,
      };
    }
  }, []);
  const PythonData = useCallback(async (url: string, field: any) => {
    const urlSplit = url.split("/");
    const endpoint = urlSplit.slice(3, urlSplit.length).join("/");
    try {
      const response = await axios.post(url, field);
      const result = response.data;

      // addLogActivity(
      //   "page log",
      //   "PAGE_LOG",
      //   `success phyton data from URL /${endpoint}`,
      //   endpoint
      // );
      if (result.message === "SUCCESS" && result.status === 0) {
        return {
          status: true,
          message: "Python script compiled successfully",
          data: result.data,
          validationMessage: result.data?.message || "succeed in compiling the rule script",
        };
      } else if (result.status === 0 && result.data?.message) {
        const errorMessage = result.data.message;
        const isPythonError = errorMessage.includes("SyntaxError") || errorMessage.includes('File "') || errorMessage.includes("line ");

        return {
          status: false,
          message: "Python script validation failed",
          data: result.data,
          validationMessage: errorMessage,
          errorType: isPythonError ? "syntax_error" : "validation_error",
        };
      } else {
        return {
          status: false,
          message: "Unexpected response format",
          data: result.data || null,
          validationMessage: result.message || "Unknown validation error",
        };
      }
    } catch (error: any) {
      // addLogActivity(
      //   "page log",
      //   "PAGE_LOG",
      //   `failed phyton data from URL /${endpoint}`,
      //   endpoint
      // );
      const { response } = error;
      return {
        status: false,
        message: "Network or server error",
        data: null,
        validationMessage: response?.data?.error ?? response?.data?.message ?? "Unknown error occurred",
        errorType: "network_error",
      };
    }
  }, []);

  return { PythonData, GetData, PostData, PutData, DeleteData, GetExportData, GetExport };
};

export { useCallApi };
