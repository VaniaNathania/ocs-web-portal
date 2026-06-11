import { useEffect, useState } from "react";
import { useZoneMainListContext } from "../hooks/useZoneContext";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import axios from "axios";

const API_URL_REF = apiConfigRef.ref;

const ExportZoneValue = () => {
  const { 
    showExportZoneValue, 
    setShowExportZoneValue, 
    selectedChildrenSide 
  } = useZoneMainListContext();
  
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedChildrenSide?.zoneId) {
      toast.error("Please select a zone first");
      setShowExportZoneValue(false);
      return;
    }

    setIsExporting(true);

    try {
      const zoneId = selectedChildrenSide.zoneId;
      const url = `${API_URL_REF}/api/zone/export-zone-value/${zoneId}`;

      const response = await axios.get(url, {
        responseType: 'blob',
      });

      let fileName = `zone_value_export_${zoneId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success("Zone values exported successfully");
    } catch (error: any) {
      let errorMessage = "Failed to export zone values";
      
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch {
          // If blob is not JSON, use default message
        }
      } else if (error?.response?.data) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else {
        errorMessage = error?.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
      setShowExportZoneValue(false);
    }
  };

  useEffect(() => {
    if (showExportZoneValue && !isExporting) {
      handleExport();
    }

  }, [showExportZoneValue]);

  return null;
};

export default ExportZoneValue;

