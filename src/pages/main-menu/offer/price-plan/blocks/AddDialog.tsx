import { useCallback, useRef, useState } from "react"
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePricePlanListContext } from "../hooks"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiConfigOffer } from "@/config/api.config"
import { Alert, useDataGrid } from "@/components"
import { toast } from "sonner"
import { useCallApi } from "@/hooks"
import { doSaveLogActivity } from "@/actions/GlobalActions"
import moment from "moment"
import { DatePicker } from "./DatePicker"
import { Textarea } from "@/components/ui/textarea"

interface CreatePricePlanParams {
  categoryname: string
  remarks: string
  offercatgcode: any
  effdate: string
}

// interface ServiceType {
//   servType: number;
//   servTypeName: string;
//   networkType: string;
//   catgType: string;
//   paidFlag: null;
//   stdCode: null;
//   networkTypeName: string;
// }

const API_URL_OFFER = apiConfigOffer.offer

const AddDialog = () => {
  const parentRef = useRef<any | null>(null)
  const { showAddDialog, handleAddDialog, refreshCategorySideBar } = usePricePlanListContext()
  const { reload } = useDataGrid()
  const { PostData } = useCallApi()

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  })

  const [formField, setFormField] = useState<CreatePricePlanParams>({
    categoryname: "",
    remarks: "",
    offercatgcode: "",
    effdate: moment().format("YYYY-MM-DD"),
  })

  const [expBaseValidPeriod, setExpBaseValidPeriod] = useState<Date>(new Date())

  /* actions */
  const doCreateUser = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // kalau null/undefined → pakai today
      const effDateValue = formField.effdate && formField.effdate.trim() !== "" ? formField.effdate : moment().format("YYYY-MM-DD")

      const response = await PostData(`${API_URL_OFFER}/offer/category/add-offer-catg`, {
        offerCatg: {
          spId: 0,
          offerCatgType: "4",
          offerCatgName: formField.categoryname,
          comments: formField.remarks,
          offerCatgCode: formField.offercatgcode,
          offerCatgClass: "A",
          effDate: effDateValue,
        },
      })

      if (response?.status) {
        // ✅ reset form
        setFormField({
          categoryname: "",
          remarks: "",
          offercatgcode: "",
          effdate: moment().format("YYYY-MM-DD"), // default balik ke today
        })

        // ✅ close dialog
        handleAddDialog(false)

        // ✅ show success toast
        toast.success("Success Create Offer Category ")

        // ✅ refresh page / reload data
        reload()
        await refreshCategorySideBar()

        const createActivity = {
          module: "Default",
          description: `Create New Default => ${formField.categoryname}`,
          action: "C",
        }
        doSaveLogActivity(createActivity)
      } else {
        toast.error(response?.message || "Failed to create data")
        setAlert((prev) => ({
          ...prev,
          show: true,
          message: response?.message,
        }))
      }
    },
    [formField],
  )

  return (
    <Dialog open={showAddDialog} onOpenChange={(open) => handleAddDialog(open)}>
      <DialogContent className="container-fixed max-w-[1500px] flex flex-col p-10 overflow-hidden [&>button]:hidden z-40">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">New Root Category</h1>
            </div>
            <Button variant={"outline"} color="#ddd" size={"sm"} onClick={() => handleAddDialog(false)}>
              Close
            </Button>
          </div>
        </DialogHeader>
        <DialogBody className="scrollable-y py-0 mb-5 ps-0 pe-3 -me-7" ref={parentRef}>
          <div className="flex flex-col items-stretch grow gap-5 lg:gap-7.5">
            {alert.show && (
              <Alert variant="danger">
                <h3>{alert.message}</h3>
              </Alert>
            )}
            <form action="" onSubmit={doCreateUser}>
              <div className="card-body grid gap-5">
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Category Name
                      <span className="text-red-500 font-medium">*</span>
                    </label>
                    <Input
                      className="input"
                      type="text"
                      placeholder="Input name"
                      autoComplete="off"
                      value={formField.categoryname}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          categoryname: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">Category Code</label>
                    <Input
                      className="input"
                      type="text"
                      placeholder="Input code"
                      autoComplete="off"
                      value={formField.offercatgcode}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          offercatgcode: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 w-full">
                    {/* Label */}
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Effective Date
                      <span className="text-red-500 font-medium">*</span>
                    </label>

                    {/* Input (full width) */}
                    <div className="grow flex gap-2 items-center w-full">
                      <div className="relative w-full">
                        <DatePicker
                          date={formField.effdate ? new Date(formField.effdate) : undefined}
                          setDate={(selectedDate: Date | undefined) => {
                            setFormField((prev: any) => ({
                              ...prev,
                              effdate: selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : null,
                            }))
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">Remarks</label>
                    <Textarea
                      className="min-h-20"
                      placeholder="Input notes"
                      value={formField.remarks}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          remarks: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 gap-3">
                  <Button variant="outline" onClick={() => handleAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="default" className="hover:bg-blue-700" type="submit">
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export { AddDialog }
