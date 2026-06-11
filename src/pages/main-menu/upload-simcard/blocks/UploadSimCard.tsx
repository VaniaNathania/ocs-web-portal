import { DefaultTooltip, KeenIcon } from "@/components"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { UploadSimCardForm, UploadSimCardSchema } from "../schema/UploadSimCardTypeSchema"
import { initialForm } from "../schema/UploadSimCardTypeSchema"
import { Button } from "@/components/ui/button"
import { MdOutlineFileUpload } from "react-icons/md"
import { MdOutlineFileDownload } from "react-icons/md"
import React, { useEffect, useRef, useState } from "react"
import Organization, { OrgData } from "./Organization"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IoMdAlert } from "react-icons/io"
import { useCallApi } from "@/hooks"
import { apiConfigRef } from "@/config/api.config"
import { useUploadSimCardContext } from "../hooks/useUploadSimCardContext"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { FormatFileSize } from "../utils/FormatFileSize"
import { AccessWrapper } from "../../role-management/hook/useRoleCheck"
import { PopUpDialog } from "../../role-management/generalUseComp"
import { countLog } from "../model/interface"

const API_URL_REF = apiConfigRef.ref

const UploadSimCard = () => {
  const { PostData } = useCallApi()
  const { primaryNe, simType, menuPrivAccess } = useUploadSimCardContext()
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
  } = useForm<UploadSimCardForm>({
    resolver: zodResolver(UploadSimCardSchema),
    defaultValues: initialForm(primaryNe[0]?.hlrId),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadBtnRef = useRef<HTMLButtonElement>(null)

  const file = watch("file")
  const selectedSimType = watch("simCardType")
  const selectedHlrId = watch("hlrId")

  //  console.log(errors);
  const [openLogDialog, setOpenLogDialog] = useState<boolean>(false)
  const [showOrganization, setShowOrganization] = useState<boolean>(false)
  const [selectedOrg, setSelectedOrg] = useState<OrgData | null>(null)
  const [showAlert, setShowAlert] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [descLog, setDescLog] = useState<string[]>([])
  const [countLog, setCountLog] = useState<countLog>()

  const handleOrgData = (data: OrgData) => {
    setSelectedOrg(data)
    setValue("organization", data.orgId, { shouldValidate: true })
  }
  const handleShowOrganization = () => {
    setShowOrganization(true)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    if (primaryNe.length > 0) {
      const firstHlrId = primaryNe[0].hlrId ?? null
      reset(initialForm(firstHlrId))
    }
  }, [primaryNe, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    setValue("file", file, { shouldValidate: true })

    uploadBtnRef.current?.blur()
  }

  const handleDownloadTemplate = () => {
    window.open("/media/file-templates/Template.xlsx")
  }

  const onSubmit = async (data: UploadSimCardForm) => {
    if (!data.file) {
      handleAlert()
      return
    }

    const maxSize = 30 * 1024 * 1024
    if (data.file.size > maxSize) {
      toast.error("File size exceeds 30MB. Please upload a smaller file.")
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("file", data.file)
      formData.append("orgId", String(data.organization))
      formData.append("hlrId", String(data.hlrId))
      formData.append("simTypeId", String(data.simCardType))
      formData.append("staffId", "1")
      formData.append("operType", "add")

      const response = await PostData(`${API_URL_REF}/api/upload-sim-file/upload-file-sim-card`, formData)

      if (response?.status) {
        if (response?.data.duplicate >= 1) {
          // toast.error("MSISDN Exist!");
          setDescLog(response?.data?.remarks.map((e: any) => e.msisdn))
          setCountLog({ inserted: response?.data?.inserted, invalid: response?.data?.invalid, duplicate: response?.data?.duplicate })
          setOpenLogDialog(true)
        } else {
          toast.success("Success")
          handleReset()
        }
      } else {
        toast.error(response?.message)
      }
    } catch (err) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAlert = () => {
    setShowAlert(true)
  }

  const handleReset = () => {
    reset(initialForm(primaryNe[0].hlrId))
    setSelectedOrg(null)
    setValue("file", null, { shouldValidate: true })
    setValue("hlrId", null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex justify-between">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-[500px] p-2">
          <fieldset disabled={isSubmitting}>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 ">
              <Label className="text-sm text-gray-700 text-right">
                <span className="text-red-500">*</span>
                Organization
              </Label>
              <div className="relative">
                <div className="flex items-center">
                  <div className="input input-sm bg-white">
                    <Input className="border-none" value={selectedOrg?.orgName ?? ""} readOnly placeholder="Select Organization..." title={selectedOrg?.orgName} />
                    <Button size={"sm"} variant={"ghost"} type="button" className="p-0 w-[25px] h-[25px]" onClick={handleShowOrganization}>
                      <KeenIcon icon="notepad-edit" />
                    </Button>
                  </div>

                  {selectedOrg && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setValue("organization", null)
                        setSelectedOrg(null)
                      }}
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  )}
                </div>

                {errors.organization && <p className="text-sm text-red-500">{errors.organization.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-4">
              <Label className="text-sm text-gray-700 text-right">
                <span className="text-red-500">*</span>
                SIM Card Type
              </Label>
              <div className="relative">
                <div className="flex flex-row">
                  <Controller
                    name="simCardType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => {
                          field.onChange(Number(val))
                          setValue("simCardType", Number(val), {
                            shouldValidate: true,
                          })
                        }}
                        value={field.value !== null ? String(field.value) : ""}
                      >
                        <SelectTrigger className="h-[30px]">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-w-[400px]">
                          {simType.map((item) => (
                            <SelectItem key={item.simTypeId} value={String(item.simTypeId)} title={item.simTypeName}>
                              <span className="block max-w-[250px] truncate">{item.simTypeName}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {selectedSimType !== null && (
                    <Button variant="ghost" size="sm" onClick={() => setValue("simCardType", null)}>
                      <KeenIcon icon="cross" />
                    </Button>
                  )}
                </div>
                {errors.simCardType && <p className="text-sm text-red-500">{errors.simCardType.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-4">
              <Label className="text-sm text-gray-700 text-right">
                <span className="text-red-500">*</span>
                Primary NE
              </Label>
              <div className="relative">
                <div className="flex flex-row">
                  <Controller
                    name="hlrId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => {
                          field.onChange(Number(val))
                          setValue("hlrId", Number(val), {
                            shouldValidate: true,
                          })
                        }}
                        value={field.value !== null ? String(field.value) : ""}
                      >
                        <SelectTrigger className="h-[30px]">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-w-[400px]">
                          {primaryNe.map((item) => (
                            <SelectItem key={item.hlrId} value={String(item.hlrId)} title={item.hlrName}>
                              <span className="block max-w-[250px] truncate">{item.hlrName}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {selectedHlrId !== null && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setValue("hlrId", null, {
                          shouldValidate: false,
                          shouldDirty: true,
                        })
                      }
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  )}
                </div>
                {errors.hlrId && <p className="text-sm text-red-500">{errors.hlrId.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-4">
              <div className="col-start-2 flex flex-row space-x-2">
                <input type="file" className="hidden" accept=".xlsx, .xls, .txt, .csv" ref={fileInputRef} onChange={handleFileChange} multiple={false} />
                <TooltipProvider>
                  <Tooltip>
                    <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                      <TooltipTrigger asChild>
                        <Button variant="outline" ref={uploadBtnRef} type="button" onClick={handleUploadClick}>
                          <MdOutlineFileUpload />
                          Upload
                        </Button>
                      </TooltipTrigger>
                    </AccessWrapper>
                    <TooltipContent className="max-w-sm text-xs" side="bottom" align="start">
                      <p>
                        <strong>Format:</strong>
                        <br />
                        MSISDN, IMSI, ICCID, PIN1, PUK1, KI, ADM
                      </p>
                      <p className="mt-2">
                        <strong>Note:</strong>
                      </p>
                      <ul className="list-disc ml-4">
                        <li>
                          The require field is <span className="text-red-500">MSISDN, IMSI, ICCID, PIN1, PUK1, KI</span>
                        </li>
                        <li>The file size limit is 30.00MB</li>
                        <li>The maximum files count is 1</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="outline" className="" type="button" onClick={handleDownloadTemplate}>
                  <MdOutlineFileDownload />
                  <Label>File Template</Label>
                </Button>
              </div>
            </div>

            {file && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-4">
                <span></span>
                <div className="flex items-center gap-2 text-sm bg-blue-100 border rounded px-3 py-2 justify-between">
                  <DefaultTooltip title={`${file.name} (${FormatFileSize(file.size)})`}>
                    <span className="ml-2 text-sm max-w-[180px] truncate text-gray-700">{`${file.name} (${FormatFileSize(file.size)})`}</span>
                  </DefaultTooltip>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-100"
                    onClick={() => {
                      setValue("file", null, { shouldValidate: true })
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    <KeenIcon icon="cross" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-4">
              <div className="col-start-2 flex flex-row space-x-2">
                <AccessWrapper hasAccess={menuPrivAccess.addStatus ?? false}>
                  <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-700 hover:text-white" type="submit">
                    {isSubmitting ? "Uploading..." : "OK"}
                  </Button>
                </AccessWrapper>
                <Button variant="outline" onClick={() => handleReset()} type="button">
                  Reset
                </Button>
              </div>
            </div>
          </fieldset>
        </div>
      </form>

      {/* LOGGER UPLOAD DUPLICATE NUMBER */}
      <PopUpDialog
        isOpen={openLogDialog}
        handleDialog={setOpenLogDialog}
        type="alert"
        title="Log"
        desc=""
        onConfirm={async () => {
          setOpenLogDialog(false)
        }}
      >
        Summary : <br />
        {Object.entries(countLog ?? {})
          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value} `)
          .join(" | ")}
        <div className="max-h-[250px] overflow-y-auto">
          {descLog.map((e) => {
            return <div>{e} already exist!</div>
          })}
        </div>
      </PopUpDialog>
      {/* LOGGER UPLOAD DUPLICATE NUMBER */}

      <Organization isOpen={showOrganization} onClose={() => setShowOrganization(false)} organizationData={handleOrgData} setValue={setValue} />

      {showAlert && (
        <Dialog open={showAlert} onOpenChange={() => setShowAlert(false)}>
          <DialogContent className="max-w-[400px] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex flex-row gap-2">
                <IoMdAlert className="text-orange-500 size-5" />
                <DialogTitle>Warning</DialogTitle>
              </div>
            </DialogHeader>

            <div className="text-center p-10">
              <p>Please select at least one file.</p>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t flex justify-end items-center">
              <Button onClick={() => setShowAlert(false)} className="hover:bg-blue-700 hover:text-white">
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default UploadSimCard
