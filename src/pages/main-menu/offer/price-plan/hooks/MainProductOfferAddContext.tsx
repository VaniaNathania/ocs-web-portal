import React, { createContext, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DefaultTooltip, KeenIcon, ScreenLoader } from "@/components"
import { Button } from "@/components/ui/button"
import { apiConfig } from "@/config/api.config"
import { Stepper, Step, StepLabel } from "@mui/material"
import { useCallApi } from "@/hooks"
import { toast } from "sonner"
import { doSaveLogActivity } from "@/actions/GlobalActions"
import { useIntl } from "react-intl"

const API_URL = apiConfig.service_assets
const MainProductOfferAddContext = createContext<any | null>(null)

const steps = ["Step 1", "Step 2", "Step 3"]
const initialState = {
  request_order_category_id: "",
  department_id: "",
  department_name: "",
  type: "",
  description: "",
  status: "open",
  goods: [
    {
      id: "",
      quantity: 0,
      description: "",
    },
  ],
}

const MainProductOfferAddContextProvider = ({ children }: { children: React.ReactNode }) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    ...initialState,
  })
  const { PostData } = useCallApi()
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  type State = typeof initialState
  // console.log(formData);
  const validationRules: Record<number, { key: keyof State; errorMessage: string }[]> = {
    0: [
      {
        key: "request_order_category_id",
        errorMessage: "Request Order Category must be filled in.",
      },
      {
        key: "department_id",
        errorMessage: "Department must be filled in.",
      },
      {
        key: "department_name",
        errorMessage: "Department must be filled in.",
      },
      {
        key: "type",
        errorMessage: "Type must be filled in.",
      },
      {
        key: "description",
        errorMessage: "Description must be filled in.",
      },
    ],
    1: [
      {
        key: "goods",
        errorMessage: "Goods must be filled in.",
      },
    ],
    2: [],
    3: [],
  }

  const validateStep = (step: number, state: State): Record<string, string> => {
    const errors: Record<string, string> = {}
    let fieldsToValidate = validationRules[step] || []

    fieldsToValidate.forEach(({ key, errorMessage }) => {
      if (!state[key] || String(state[key]).trim() === "") {
        errors[key] = errorMessage
      }
    })

    return errors
  }

  const handleBackClick = () => navigate("/transaction/request-order/list/")

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const errors = validateStep(activeStep, formData)

      if (Object.keys(errors).length > 0) {
        const firstErrorMessage = Object.values(errors)[0]
        toast.error(firstErrorMessage)
        return
      }
      setActiveStep((prevStep) => prevStep + 1)
    } else {
      const errors = validateStep(activeStep, formData)

      if (Object.keys(errors).length > 0) {
        const firstErrorMessage = Object.values(errors)[0]
        toast.error(firstErrorMessage)
        return
      }

      handleSubmit()
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = () => {
    setFormData((prev: any) => ({ ...prev, status: "open" }))
    doCreateCredit(formData)
  }

  const resetForm = () => {
    setFormData(initialState)
  }

  const doCreateCredit = useCallback(async (updatedFormData: typeof formData) => {
    setIsLoading(true)
    let dtPost = { ...updatedFormData } as any
    dtPost.department_id = String(dtPost.department_id)
    delete dtPost.fileList
    const response = await PostData(`${API_URL}/request-order/create`, dtPost)
    if (response?.status) {
      setAlert((prev) => ({ ...prev, show: false, message: "" }))
      toast.success("Success Create Request Order")
      resetForm()
      const createActivity = {
        module: "Create Bank Garansi",
        // description: `Add new data Credit for => ${updatedFormData?.name}`,
        description: `Add new data Credit for => 'testing`,
        action: "C",
      }
      doSaveLogActivity(createActivity)
      handleBackClick()
    } else {
      setAlert((prev) => ({
        ...prev,
        show: true,
        message: response?.message,
      }))
      toast.error(response?.message)
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="flex justify-center">
      {isLoading && <ScreenLoader bg="bg-muted/50" />}
      <div className="px-5 lg:w-9/12 w-full" style={{ marginTop: "-1.25rem" }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <DefaultTooltip title="Back to list" placement="top">
              <Button variant="outline" className="h-7.5 border-0 px-0 me-[14px]" style={{ marginLeft: -5 }} onClick={handleBackClick}>
                <KeenIcon icon="arrow-left" className="text-[20px] px-1 card-title" />
              </Button>
            </DefaultTooltip>
            <p className="font-semibold text-[16px] card-title">Asset Management</p>
          </div>
        </div>

        {/* Stepper */}
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={index} style={{ marginRight: "-16px", marginLeft: "-8px" }}>
              <StepLabel></StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        {activeStep === steps.length ? (
          <div className="">
            <p style={{ marginTop: 2, marginBottom: 1 }}>Semua langkah selesai - Anda telah menyelesaikan proses</p>
          </div>
        ) : (
          <div>
            <p className="mt-3 mb-5 text-[12px] text-gray-500">{"Step " + (activeStep + 1)}/2</p>
            <div
              className="justify-center"
              style={{
                display: "flex",
                flexDirection: "row",
                paddingTop: "16px",
              }}
            >
              {activeStep !== 0 && (
                <Button className="me-5 text-[14px] w-[9rem] btn btn-outline-secondary bg-gray-200 text-gray-800" disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button className="text-[14px] w-[9rem] btn btn-primary bg-primary" style={{ backgroundColor: "#00519D" }} onClick={handleNext}>
                {activeStep === steps.length - 1 ? "Send" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { MainProductOfferAddContext, MainProductOfferAddContextProvider }
