import { useEffect, useRef, useState } from "react";
import { BatchDealFilesProps, FileType, queryTempTable, StatusProps, UploadResponse } from "../interface";
import { toast } from "sonner";
import { usePreNew } from "../hooks/context";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";

const API_URL = apiConfigOrder.order;

const useStep3 = () => {
  const { GetData, PostData } = useCallApi();
  const { form, setForm, initialUploadFiles } = usePreNew();
  const { uploadFiles } = form;
  const [triggerFetch, setTriggerFetch] = useState(false);

  const prevAccNbrBegin = useRef<string | undefined>();
  const prevAccNbrEnd = useRef<string | undefined>();
  const prevIccidBegin = useRef<string | undefined>();
  const prevSearchQuantity = useRef<number | undefined>();

  const iccidFileInputRef = useRef<HTMLInputElement>(null);
  const iccidUploadBtnRef = useRef<HTMLButtonElement>(null);
  const serviceNumberFileInputRef = useRef<HTMLInputElement>(null);
  const serviceNumberUploadBtnRef = useRef<HTMLButtonElement>(null);
  const MAX_FILE_UPLOAD = 20;
  const MAX_FILE_SIZE = 30 * 1024 * 1024;
  const [triggerReset, setTriggerReset] = useState(0);

  const fetchQryTempTableForBatchPNC = async () => {
    try {
      setForm((prev) => ({
        ...prev,
        isLoading: true,
      }));

      const response = await GetData(`${API_URL}/api/order-entry/temp-table/query-temp-table-for-batch-pre-new-connection`, {});

      const data: string = response?.data ?? [];

      setForm((prev) => ({
        ...prev,
        tempTableName: data,
      }));

      return data;
    } catch (err) {
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const fetchUpload = async () => {
    if (!uploadFiles) return;
    try {
      setForm((prev) => ({
        ...prev,
        isLoading: true,
      }));

      const formData = new FormData();

      Object.entries(uploadFiles).forEach(([_, value]) => {
        value.files.forEach((file) => {
          formData.append("files", file);
        });
      });

      //  console.log("formData", formData);

      const response = await PostData(`${API_URL}/api/order-entry/pre-new-connection/batchDealFiles/upload`, formData);

      const data = response?.data ?? [];

      setForm((prev) => ({
        ...prev,
        uploadResponse: data,
      }));

      return data;
    } catch (err) {
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const fetchBatchDealFiles = async (fileDatas: UploadResponse[], tableName: string) => {
    //  console.log(fileDatas, "FILEDATAS RESPONSE");
    try {
      setForm((prev) => ({
        ...prev,
        isLoading: true,
      }));

      const payload = {
        requestParam: {
          arg: {
            TABLE_NAME: "",
            MODEl_ID: null,
            ORG_ID: 1,
            tableName: tableName,
            isFile: true,
            fileType: "ACC_NBR_AND_ICCID",
            FILES: fileDatas.map((item) => ({
              fileName: item?.fileName,
              filePath: item?.filePath,
              withHead: true,
              lineDefine: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
              fileKey: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
            })),
            servType: "15",
            offerIds: "355,417",
            prefix: "",
            banding: true,
            accordAccNbr: true,
            hasIccid: false,
            hasGmGoods: false,
          },
          files: fileDatas.map((item) => ({
            fileName: item?.fileName,
            filePath: item?.filePath,
            withHead: true,
            lineDefine: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
            fileKey: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
            WITH_HEAD: true,
            SEPARATOR: ",",
            LINE_DEFINE: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
            FILE_KEY: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
          })),
          filesTypes: "1",
          type: "BATCH",
          separator: ",",
          lineDefine: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
          cls: "com.sts.sinorita.orderentry.service.prenewconnection.BatchPreNewConnectionService",
          withFile: true,
          count: 2000,
          withHead: true,
          batch: true,
          exitWithException: true,
          filesPrimaryKey: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
          fileKey: form.resourceType === "0" ? "ACC_NBR" : "ICCID",
          sinorita_fish_flag: true,
        },
      };

      const response = await PostData(`${API_URL}/api/order-entry/pre-new-connection/batchDealFiles`, payload);

      const datas: BatchDealFilesProps = response?.data ?? [];

      if (response?.status) {
        setForm((prev) => ({
          ...prev,
          batchDealFiles: datas,
        }));

        return datas;
      } else {
        toast.error(response?.message || "Failed GetData!");
      }
    } catch (err) {
      toast.error("Failed GetData!");
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const fetchQryAccNbrEndByBindCount = async (accNbrBegin: string | undefined, prefix: string | undefined, searchQuantity: number | undefined) => {
    setForm((prev) => ({
      ...prev,
      isLoading: true,
    }));
    //  console.log("accNbrBegin", accNbrBegin);
    try {
      const response = await GetData(`${API_URL}/api/order-entry/pre-new-connection/qry-acc-nbr-end-by-bind-count`, {
        prefix,
        orgId: 1,
        accNbrBegin,
        servType: "15",
        spId: 0,
        rownum: searchQuantity,
      });

      if (!response.status) {
        toast.error(response.message || "Failed Get Data!");
      }

      setForm((prev) => ({
        ...prev,
        quantityResp: response.data.cnt === 0 || response.data.cnt === undefined ? "" : response.data.cnt,
      }));

      return response.data.cnt;
    } catch (err) {
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const fetchTempTableName = async (quantity: number | undefined) => {
    if (quantity === undefined || quantity === null) return;
    setForm((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const payload = {
        servType: "15",
        offerIds: "355,417",
        accNbrBegin: form.accNbrBegin ?? null,
        accNbrEnd: form.accNbrEnd ?? null,
        iccidBegin: form.iccidBegin ?? null,
        iccidEnd: form.iccidEnd ?? null,
        esnEnd: null,
        modelId: null,
        prefix: form.selectedPrefix ?? null,
        banding: true,
        accordAccNbr: form.resourceType === "0" ? true : false,
        hasIccid: false,
        hasGmGoods: false,
        quantity: form.searchType === "1" && form.searchQuantity ? form.searchQuantity : quantity,
        rownum: form.searchType === "1" && form.searchQuantity ? form.searchQuantity : quantity,
      };
      const response = await PostData(`${API_URL}/api/order-entry/pre-new-connection/qry-temp-table-name`, payload);

      if (!response?.status) {
        toast.error(response?.message || "Failed Get Data!");
      }

      setForm((prev) => ({
        ...prev,
        tempTableName: response?.data,
      }));

      return response?.data;
    } catch (err) {
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const fetchStatus = async (batchId: string) => {
    try {
      setForm((prev) => ({
        ...prev,
        isLoading: true,
      }));
      const response = await GetData(`${API_URL}/api/order-entry/pre-new-connection/bacthDealFiles/status/${batchId}`, {
        batchId: batchId,
      });

      const datas: StatusProps = response.data;

      if (response?.status) {
        setForm((prev) => ({
          ...prev,
          statusResp: datas,
        }));
      } else {
        //  console.log("failed", datas);
        toast.error("Failed GetData!");
        return datas;
      }

      return datas;
    } catch (err) {
      toast.error("Failed GetData!");
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const fetchTempTable = async (tableName?: string, statusData?: StatusProps, accNbrId?: number, simCardId?: number, goodsId?: number) => {
    //  console.log("tableNamePayload", tableName);
    if (!tableName) return;
    try {
      setForm((prev) => ({
        ...prev,
        isLoading: true,
      }));
      const response = await GetData(`${API_URL}/api/order-entry/temp-table/query-temp-table`, { tableName, accNbrId, simCardId, goodsId });

      const datas = response.data ?? [];

      if (response?.status) {
        if (datas.length === 0 && statusData) {
          toast.error("No data found!");
          return;
        }

        setForm((prev) => ({
          ...prev,
          tempTable: datas,
          selectedItemStep3: datas[0],
        }));
      }

      return datas;
    } catch (err) {
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const fetchCountAccNbr = async (accNbrBegin: string | undefined, accNbrEnd: string | undefined, prefix: string | undefined) => {
    if (!accNbrBegin && !accNbrEnd && !prefix) return;

    setForm((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await GetData(`${API_URL}/api/order-entry/pre-new-connection/count-acc-nbr`, {
        accNbrBegin,
        accNbrEnd,
        prefix,
        servType: "15",
        state: "A",
        bindingFlag: "Y",
        spId: 0,
      });

      if (!response.status) {
        toast.error("Failed Get Data!");
      }

      setForm((prev) => ({
        ...prev,
        quantityAccNbrResp: response.data.cnt === 0 || response.data.cnt === undefined ? "" : response.data.cnt,
      }));

      return response.data.cnt;
    } catch (err) {
      console.error(err);
    } finally {
      setForm((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const fetchCountIccid = async (iccidBegin: string | undefined, iccidEnd: string | undefined) => {
    if (!iccidBegin || !iccidEnd) return;

    setForm((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const response = await GetData(`${API_URL}/api/order-entry/pre-new-connection/count-iccid`, {
        iccidBegin,
        iccidEnd,
      });

      if (!response.status) {
        toast.error("Failed GetData!");
      }

      setForm((prev) => ({
        ...prev,
        quantityIccidResp: response.data.cnt === 0 || response.data.cnt === undefined ? "" : response.data.cnt,
      }));

      return response.data.cnt;
    } catch (err) {
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const handleQuery = async () => {
    //  console.log(uploadFiles);

    if ((form.operationType === "0" && form.resourceType === "0" && form.uploadFiles?.SERVICENUMBER.files?.length === 0) || (form.operationType === "0" && form.resourceType === "1" && form.uploadFiles?.ICCID.files?.length === 0)) {
      toast.error("Please Upload File First!");
      return;
    }

    if (form.operationType === "1" && form.searchType === "0" && (form.resourceType === "0" || form.resourceType === "2") && (!form.selectedPrefix || !form.accNbrBegin || !form.accNbrEnd || !form.quantityAccNbrResp)) {
      toast.error("Please Fill All Required Fields!");
      return;
    }

    if (form.searchType === "1" && (form.resourceType === "0" || form.resourceType === "2") && (!form.selectedPrefix || !form.accNbrBegin || !form.searchQuantity)) {
      toast.error("Please Fill All Required Fields!");
      return;
    }

    if (form.operationType === "0") {
      const tableName = await fetchQryTempTableForBatchPNC();

      const fileDatas = await fetchUpload();

      if (!tableName || !fileDatas) return;

      const batchData = await fetchBatchDealFiles(fileDatas, tableName);

      if (!batchData?.id) return;

      const statusData = await fetchStatus(batchData?.id);

      if (!statusData) return;

      await fetchTempTable(tableName, statusData);
    }

    if (form.operationType === "1") {
      if (form.searchType === "0") {
        const tempTableName = await fetchTempTableName(form.quantityAccNbrResp);

        if (!tempTableName) return;

        await fetchTempTable(tempTableName);
      }

      if (form.searchType === "1" && form.accNbrBegin && form.selectedPrefix && form.searchQuantity) {
        const quantity = form.quantityAccNbrResp;
        if (quantity === undefined || quantity === null) return;

        const tempTableName = await fetchTempTableName(quantity);

        if (!tempTableName) return;

        //  console.log("tempTableName query", tempTableName);

        await fetchTempTable(tempTableName);
      }

      if (form.searchType === "1" && form.resourceType === "1" && form.iccidBegin && form.searchQuantity) {
        const quantity = form.searchQuantity;
        if (quantity === undefined || quantity === null) return;

        const tempTableName = await fetchTempTableName(quantity);

        if (!tempTableName) return;

        //  console.log("tempTableName query", tempTableName);

        await fetchTempTable(tempTableName);
      }
    }
  };

  const handleRowClick = (item: queryTempTable) => {
    setForm((prev) => ({
      ...prev,
      selectedItemStep3: item,
    }));
  };

  const handleUploadClick = (type: FileType) => {
    if (type === "ICCID") {
      //  console.log("ICCID UPLOAD CLICK");
      iccidFileInputRef.current?.click();
    } else {
      //  console.log("SERVICE NUMBER UPLOAD CLICK");
      serviceNumberFileInputRef.current?.click();
    }
  };

  const handleFileChange = (type: FileType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 30MB. Please upload a smaller file.");
      e.target.value = "";
      return;
    }

    setForm((prev) => {
      if (!prev.uploadFiles) return prev;
      const currentCount = prev.uploadFiles[type].files.length;
      const duplicated = prev.uploadFiles[type].files.some((item) => item.name === file.name);

      if (currentCount >= MAX_FILE_UPLOAD) {
        toast.error("Maximum File Count Reached!");
        return prev;
      }

      if (duplicated) {
        toast.error(`${file.name} is already exist!`);
        return prev;
      }

      return {
        ...prev,
        uploadFiles: {
          ...prev.uploadFiles,
          [type]: {
            files: [...prev.uploadFiles[type].files, file],
            fileNames: [...prev.uploadFiles[type].fileNames, file.name],
          },
        },
      };
    });

    e.target.value = "";
  };

  const handleDownloadTemplate = (type: FileType) => {
    if (type === "ICCID") {
      window.open("/media/file-templates/Template-Iccid.xlsx");
    } else {
      window.open("/media/file-templates/Template-ServiceNumber.xlsx");
    }
  };

  const handleRemoveFile = (type: FileType, index: number) => {
    setForm((prev) => {
      if (!prev.uploadFiles) return prev;

      return {
        ...prev,
        uploadFiles: {
          ...prev.uploadFiles,
          [type]: {
            ...prev.uploadFiles[type],
            files: [...prev.uploadFiles[type].files.filter((_, i) => i !== index)],
            fileNames: [...prev.uploadFiles[type].fileNames.filter((_, i) => i !== index)],
          },
        },
      };
    });
  };

  const handleReset = () => {
    setTriggerReset((prev) => prev + 1);
    if (form.operationType === "0") {
      setForm((prev) => ({
        ...prev,
        uploadFiles: initialUploadFiles,
      }));

      setForm((prev) => ({
        ...prev,
        tempTable: [],
      }));
    }

    if ((form.operationType === "1" && form.searchType === "0") || (form.operationType === "1" && form.searchType === "1")) {
      setForm((prev) => ({
        ...prev,
        selectedPrefix: "",
        accNbrBegin: undefined,
        accNbrEnd: undefined,
        quantityAccNbrResp: undefined,
        searchQuantity: undefined,
        iccidBegin: undefined,
        iccidEnd: undefined,
        quantityIccidResp: undefined,
        resourceType: "0",
      }));
    }

    setForm((prev) => ({
      ...prev,
      tempTable: [],
    }));
  };

  useEffect(() => {
    if (!triggerFetch) return;

    if (form.searchType === "0" && form.selectedPrefix && form.accNbrBegin && prevAccNbrBegin.current !== form.accNbrBegin) {
      fetchCountAccNbr(form.accNbrBegin, form.accNbrEnd, form.selectedPrefix);

      prevAccNbrBegin.current = form.accNbrBegin;
    }

    if (form.searchType === "0" && form.selectedPrefix && form.accNbrEnd && prevAccNbrEnd.current !== form.accNbrEnd) {
      fetchCountAccNbr(form.accNbrBegin, form.accNbrEnd, form.selectedPrefix);

      prevAccNbrEnd.current = form.accNbrEnd;
    }

    if (form.searchType === "1" && form.accNbrBegin && form.selectedPrefix && form.searchQuantity && prevSearchQuantity.current !== form.searchQuantity) {
      fetchQryAccNbrEndByBindCount(form.accNbrBegin, form.selectedPrefix, form.searchQuantity);

      prevSearchQuantity.current = form.searchQuantity;
    }

    if (form.searchType === "0" && form.iccidBegin && prevIccidBegin.current !== form.iccidBegin) {
      fetchCountIccid(form.iccidBegin, form.iccidEnd);

      prevIccidBegin.current = form.iccidBegin;
    }

    setTriggerFetch(false);
  }, [triggerFetch]);

  return {
    handleDownloadTemplate,
    handleFileChange,
    handleQuery,
    handleRemoveFile,
    handleReset,
    handleUploadClick,
    handleRowClick,
    iccidFileInputRef,
    iccidUploadBtnRef,
    serviceNumberFileInputRef,
    serviceNumberUploadBtnRef,
    uploadFiles,
    fetchQryAccNbrEndByBindCount,
    prevAccNbrBegin,
    triggerFetch,
    setTriggerFetch,
    prevSearchQuantity,
    prevIccidBegin,
    triggerReset,
    setTriggerReset,
  };
};

export default useStep3;
