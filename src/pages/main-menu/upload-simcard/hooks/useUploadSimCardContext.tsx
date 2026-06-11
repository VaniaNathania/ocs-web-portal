import { useContext } from "react";
import { UploadSimCardContext } from "./UploadSimCardContext";

const useUploadSimCardContext = () => {
  const context = useContext(UploadSimCardContext);
  if (!context) throw new Error("useUploadSimCardContext must be used within AuthProvider");

  return context;
};

export { useUploadSimCardContext };
