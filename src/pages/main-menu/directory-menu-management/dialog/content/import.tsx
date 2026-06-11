import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

type FormValues = {
  file: FileList; // react-hook-form stores files as FileList
};

export const ImportContent = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const handleSave = async (data: FormValues) => {
    const file = data.file?.[0];
    if (!file) return;

    //  console.log("Uploading file:", file);

    // TODO: push to API (multipart/form-data)
    // const formData = new FormData();
    // formData.append("file", file);
    // await api.post("/directories/upload", formData);
  };

  const handleDownloadTemplate = () => {
    // Example: trigger download from public folder or API
    window.open("/templates/directory-template.xlsx", "_blank");
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-4 mt-5">
      {/* File Input */}
      <div className="flex flex-col flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700">
          Upload File<span className="text-red-500 ml-1">*</span>
        </label>
        <Input
          type="file"
          className="pr-10"
          accept=".xlsx,.csv"
          {...register("file", { required: "File is required" })}
        />
        {errors.file && (
          <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="w-full flex justify-between">
        {/* Download template button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadTemplate}
        >
          <KeenIcon icon="file-down" />
          Download Template
        </Button>

        {/* Submit upload button */}
        <Button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Upload
        </Button>
      </div>
    </form>
  );
};
