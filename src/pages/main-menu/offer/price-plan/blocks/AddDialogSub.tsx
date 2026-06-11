import { useCallback, useEffect, useRef, useState } from "react"
import moment from "moment"
import { usePricePlanListContext } from "../hooks"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiConfigOffer } from "@/config/api.config"
import { useDataGrid } from "@/components"
import { toast } from "sonner"
import { useCallApi } from "@/hooks"
import { doSaveLogActivity } from "@/actions/GlobalActions"
import { DatePicker } from "./DatePicker"
import { X } from "lucide-react"
import { apiConfig } from "@/config/api.config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MdKeyboardArrowDown } from "react-icons/md"
import { Checkbox } from "@/components/ui/checkbox"
import Swal from "sweetalert2"

interface CreatePricePlanParams {
  priceplanname: string | null
  priceplancode: string | null
  servicetype?: any
  validperiodstart: string | null
  validperiodend: string | null
  applylevel: string | null
  priceplantype: any
  ispackage?: string | null
  packagemode?: string | null
  quantitylimitupper?: any
  quantitylimitlower?: any
  saleprice?: any
  rentprice?: any
  duplicateorder?: string | null
  effectivetype: string | null
  ordertimelimitinput?: string | null
  ordertimelimitselect?: string | null
  automaticrenewal?: string | null
  agreementperiodinput?: string | null
  agreementperiodselect?: string | null
  agreementaffectiveinput?: string | null
  agreementaffectiveselect?: string | null
  remarks?: string | null
}

const API_URL_OFFER = apiConfigOffer.offer
const API_URL_8080 = apiConfig.service_price_plan

const AddDialogSub = () => {
  const parentRef = useRef<any | null>(null)
  const { showAddDialogSub, handleAddDialogsub, addDialogCatgId, fetchOfferData, getOfferMenuItems } = usePricePlanListContext()
  const { reload } = useDataGrid()
  const { PostData, GetData } = useCallApi()
  const [serviceType, setServiceType] = useState<any[]>([])
  const [loading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [selected, setSelected] = useState<any>(null)
  const [isOpen2, setIsOpen] = useState(false)
  const [pricePlanType, setPricePlanType] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [effTypeOpen, setEffTypeOpen] = useState(false)
  const [selectedEffType, setSelectedEffType] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [alert, setAlert] = useState({ show: false, message: "" })
  const hasFetched = useRef(false)
  // const [openDropdown, setOpenDropdown] = useState<string | null>(null); // serviceType | null

  const effectiveType = [
    { label: "Special Day", value: "A" },
    { label: "Instant", value: "B" },
    { label: "Next Day", value: "C" },
    { label: "Next Week", value: "D" },
    { label: "Next Month", value: "E" },
    { label: "Next Billing Cycle", value: "F" },
    { label: "The Cycle After Next Cycle", value: "G" },
    { label: "Special Time", value: "H" },
  ]

  const [formField, setFormField] = useState<CreatePricePlanParams>({
    priceplanname: null,
    priceplancode: null,
    servicetype: null,
    validperiodstart: moment().format("YYYY-MM-DD"),
    validperiodend: null,
    applylevel: null,
    priceplantype: null,
    ispackage: null,
    packagemode: null,
    quantitylimitupper: null,
    quantitylimitlower: null,
    saleprice: null,
    rentprice: null,
    duplicateorder: null,
    effectivetype: null,
    ordertimelimitinput: null,
    ordertimelimitselect: null,
    automaticrenewal: null,
    agreementperiodinput: null,
    agreementperiodselect: null,
    agreementaffectiveinput: null,
    agreementaffectiveselect: null,
    remarks: null,
  })

  const fetchServiceType = async () => {
    if (hasFetched.current) return // ✅ kalau sudah pernah fetch, langsung keluar

    setIsLoading(true)
    try {
      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        page: 1,
        size: 9999,
        sortBy: "SERV_TYPE_NAME",
        sortDirection: "asc",
        search: "",
      })

      const total = response.totalRows || 0
      setTotalRows(total)

      const dataArray = Array.isArray(response.data) ? response.data : [response.data]
      setServiceType(dataArray)

      hasFetched.current = true // ✅ tandai sudah fetch
    } finally {
      setIsLoading(false)
    }
  }

  // helper aman
  const toLow = (v: any) => (v ?? "").toString().toLowerCase()
  const term = (search ?? "").toLowerCase()

  const filteredServiceTypes = serviceType.filter((item: any) => {
    const code = toLow(item?.networkTypeName)
    const name = toLow(item?.servTypeName)
    return code.includes(term) || name.includes(term)
  })

  const fetchPricePlanType = async () => {
    try {
      const response = await GetData(`${API_URL_8080}/priceplan/all-type/list`, {})

      if (response?.status) {
        let dataArray: any[] = []

        if (Array.isArray(response.data)) {
          dataArray = response.data // langsung pakai array
        } else if (response.data) {
          dataArray = [response.data] // bungkus jadi array
        }

        setPricePlanType(dataArray)
        return dataArray
      } else {
        throw new Error("Data tidak ditemukan atau response tidak valid")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal fetch detail content"
      console.error("❌ Error fetching detail:", err)
      setError(errorMessage)
      toast.error(`failed to fetch data price plan type: ${errorMessage}`)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPricePlanType()
  }, [])

  useEffect(() => {
    if (formField.ispackage !== "Y") {
      setFormField((prev) => ({
        ...prev,
        packagemode: null,
      }))
    }
  }, [formField.ispackage])

  useEffect(() => {
    if (formField.packagemode !== "B") {
      setFormField((prev) => ({
        ...prev,
        quantitylimitlower: null,
        quantitylimitupper: null,
      }))
    }
  }, [formField.packagemode])

  // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   const target = e.currentTarget;
  //   if (
  //     target.scrollTop + target.clientHeight >= target.scrollHeight - 5 &&
  //     !loading &&
  //     serviceType.length < totalRows
  //   ) {
  //     setPage((prev) => {
  //       const nextPage = prev + 1;
  //       fetchServiceType(nextPage);
  //       return nextPage;
  //     });
  //   }
  // };

  const [startdatevalidperiod, setstartdatevalidperiod] = useState<Date>(new Date())

  const [enddatevalidperiod, setenddatevalidperiod] = useState<Date>(new Date())

  const handleCancel = () => {
    handleAddDialogsub(false)
  }

  useEffect(() => {
    const joinedEffType = selectedEffType.join("|")
    setFormField((prev) => ({
      ...prev,
      // offer: {
      //   ...prev.offer,
      effectivetype: joinedEffType,
      // },
    }))
  }, [selectedEffType])

  /* actions */
  const doSubmitSub = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      // 🚀 tampilkan loading swal
      Swal.fire({
        title: "Please wait...",
        text: "Submitting your data",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      try {
        const response = await PostData(`${API_URL_OFFER}/offer/price-plan/add-price-plan-offer`, {
          offerName: formField.priceplanname,
          offerCode: formField.priceplancode,
          servType: formField.servicetype,
          effDate: formField.validperiodstart,
          expDate: formField.validperiodend,
          applyLevel: formField.applylevel,
          pricePlanType: formField.priceplantype,
          isPackage: formField.ispackage,
          groupType: formField.packagemode,
          lowerLimit: formField.quantitylimitlower,
          upperLimit: formField.quantitylimitupper,
          saleListPrice: Number(formField.saleprice),
          rentListPrice: Number(formField.rentprice),
          effType: formField.effectivetype,
          duplicateFlag: formField.duplicateorder,
          expOff: formField.ordertimelimitinput,
          expTimeUnit: formField.ordertimelimitselect,
          autoContinueFlag: formField.automaticrenewal,
          cycleQuantity: formField.agreementperiodinput,
          timeUnit: formField.agreementperiodselect,
          agreementEffType: formField.agreementaffectiveinput,
          comments: formField.remarks,
          offerType: "4",
          offerCatgId: String(addDialogCatgId),
          spId: 0,
          offer: {
            offerName: formField.priceplanname,
            offerCode: formField.priceplancode,
            servType: formField.servicetype,
            effDate: formField.validperiodstart,
            expDate: formField.validperiodend,
            applyLevel: formField.applylevel,
            pricePlanType: formField.priceplantype,
            isPackage: formField.ispackage,
            groupType: formField.packagemode,
            lowerLimit: formField.quantitylimitlower,
            upperLimit: formField.quantitylimitupper,
            saleListPrice: Number(formField.saleprice),
            rentListPrice: Number(formField.rentprice),
            effType: formField.effectivetype,
            duplicateFlag: formField.duplicateorder,
            expOff: formField.ordertimelimitinput,
            expTimeUnit: formField.ordertimelimitselect,
            autoContinueFlag: formField.automaticrenewal,
            cycleQuantity: formField.agreementperiodinput,
            timeUnit: formField.agreementperiodselect,
            agreementEffType: formField.agreementaffectiveinput,
            comments: formField.remarks,
            offerType: "4",
            offerCatgId: String(addDialogCatgId),
            spId: 0,
          },
        })

        if (response?.status) {
          Swal.close() // tutup loading
          await fetchOfferData()
          if (addDialogCatgId) {
            await getOfferMenuItems(String(addDialogCatgId))
          }

          handleAddDialogsub(false)
          reload()
          doSaveLogActivity({
            module: "Default",
            description: `Create New Price Plan Offer => ${formField.priceplanname}`,
            action: "C",
          })

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Price Plan Offer created successfully!",
          })
        } else {
          Swal.close() // tutup loading
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: response?.message || "Something went wrong",
          })
        }
      } catch (err: any) {
        Swal.close()
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unexpected error occurred!",
        })
      }
    },
    [formField],
  )

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Tutup dropdown custom kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    setAlert({ show: false, message: "" })

    if (selectedEffType.length === 0) {
      newErrors["effectivetype"] = "Effective Type is required"
      isValid = false
    }

    if (!formField.priceplanname || formField.priceplanname.trim() === "") {
      newErrors["priceplanname"] = "Price Plan Name is required"
      isValid = false
    }

    if (!formField.priceplancode || formField.priceplancode.trim() === "") {
      newErrors["priceplancode"] = "Price Plan Code is required"
      isValid = false
    }

    if (!formField.validperiodstart) {
      newErrors["validperiodstart"] = "Valid Period Start is required"
      isValid = false
    }

    if (!formField.applylevel) {
      newErrors["applylevel"] = "Apply Level is required"
      isValid = false
    }

    if (!formField.priceplantype) {
      newErrors["priceplantype"] = "Price Plan Type is required"
      isValid = false
    }

    setErrors(newErrors)

    if (!isValid) {
      const firstError = Object.values(newErrors)[0]
      setAlert({
        show: true,
        message: firstError || "Please fill in all required fields",
      })
    }

    return isValid
  }

  return (
    <div className="z-[999] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[93vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Price Plan Detail</h2>
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Content Container */}
        <form action="" onSubmit={doSubmitSub} className="flex-1 overflow-auto">
          {alert.show && (
            <div className="m-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{alert.message}</p>
            </div>
          )}
          <div>
            <div className="flex min-h-full">
              {/* Left Panel - Available Features */}
              <div className="flex-1 border-r flex flex-col min-h-0">
                <div className="flex-1 overflow-auto min-h-0">
                  {/* Form Section */}
                  <div className="w-full p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium">
                          <span className="text-red-500">*</span>Price Plan Name
                        </label>
                        <Input
                          className={`input ${errors["priceplanname"] ? "border-red-500" : ""}`}
                          type="text"
                          placeholder="Input Price Plan Name"
                          autoComplete="off"
                          value={formField.priceplanname ?? ""}
                          onChange={({ target }) =>
                            setFormField((prev) => ({
                              ...prev,
                              priceplanname: target.value === "" ? null : target.value,
                            }))
                          }
                        />
                        {errors["priceplanname"] && <p className="text-red-500 text-xs mt-1">{errors["priceplanname"]}</p>}
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          <span className="text-red-500">*</span>Price Plan Code
                        </label>
                        <Input
                          className={`input ${errors["priceplancode"] ? "border-red-500" : ""}`}
                          type="text"
                          placeholder="Input Price Plan Code"
                          autoComplete="off"
                          value={formField.priceplancode ?? ""}
                          onChange={({ target }) =>
                            setFormField((prev) => ({
                              ...prev,
                              priceplancode: target.value === "" ? null : target.value,
                            }))
                          }
                        />
                        {errors["priceplancode"] && <p className="text-red-500 text-xs mt-1">{errors["priceplancode"]}</p>}
                      </div>

                      <div className="w-full relative" ref={dropdownRef}>
                        <label className="text-sm font-medium block mb-1">Service Type</label>

                        {/* Selected Box */}
                        <div
                          className="border rounded-lg px-3 py-2 text-sm flex justify-between items-center shadow-sm bg-white cursor-pointer"
                          onClick={() => {
                            if (!isOpen2) {
                              fetchServiceType() // ✅ fetch hanya saat pertama kali buka
                            }
                            setIsOpen(!isOpen2)
                          }}
                        >
                          <span className={selected ? "text-gray-800" : "text-gray-400"}>{selected ? `${selected.servTypeName} [${selected.networkTypeName}]` : "--- Please Select ---"}</span>
                          <svg className={`w-4 h-4 ml-2 transform transition-transform ${isOpen2 ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {/* Dropdown List */}
                        {isOpen2 && (
                          <div className="absolute mt-1 w-full border rounded-lg bg-white shadow-lg z-20">
                            {/* Search Box */}
                            <div className="p-2">
                              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search service type..." className="w-full border rounded px-2 py-1 text-sm" />
                            </div>

                            <div className="max-h-48 overflow-y-auto">
                              {loading ? (
                                <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                              ) : filteredServiceTypes.length > 0 ? (
                                filteredServiceTypes.map((item: any) => (
                                  <div
                                    key={item.servType}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 ${selected?.servType === item.servType ? "bg-gray-100 font-medium" : ""}`}
                                    onClick={() => {
                                      setSelected(item)
                                      setFormField((prev: any) => ({
                                        ...prev,
                                        servicetype: item.servType,
                                      }))
                                      setIsOpen(false)
                                    }}
                                  >
                                    {`${item.servTypeName ?? ""} [${item.networkTypeName}]`}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          <span className="text-red-500">*</span>Valid Period
                        </label>
                        <div className="flex space-x-4 mt-1">
                          {/* Start Date */}
                          <input
                            type="date"
                            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${errors["validperiodstart"] ? "border-red-500" : "border-gray-300"}`}
                            value={formField.validperiodstart ?? ""}
                            onChange={(e) => {
                              const newStart = e.target.value === "" ? null : e.target.value
                              if (formField.validperiodend && newStart && moment(newStart).isAfter(formField.validperiodend)) {
                                toast.error("Start date cannot more than enddate")
                                return
                              }
                              setFormField((prev: any) => ({
                                ...prev,
                                validperiodstart: newStart,
                              }))
                            }}
                          />

                          <span>-</span>

                          {/* End Date */}
                          <input
                            type="date"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            value={formField.validperiodend ?? ""}
                            onChange={(e) => {
                              const newEnd = e.target.value === "" ? null : moment(e.target.value).format("YYYY-MM-DD")
                              if (formField.validperiodstart && newEnd && moment(formField.validperiodstart).isAfter(newEnd)) {
                                toast.error("Start date cannot more than enddate")
                                return
                              }
                              setFormField((prev: any) => ({
                                ...prev,
                                validperiodend: newEnd,
                              }))
                            }}
                          />
                        </div>
                        {errors["validperiodstart"] && <p className="text-red-500 text-xs mt-1">{errors["validperiodstart"]}</p>}
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          <span className="text-red-500">*</span>Apply Level
                        </label>
                        <Select
                          onValueChange={(val) =>
                            setFormField((prev) => ({
                              ...prev,
                              applylevel: val === "" ? null : val,
                            }))
                          }
                          value={formField.applylevel ?? undefined}
                        >
                          <SelectTrigger className={`w-full border rounded px-2 py-1 text-sm mt-1 ${errors["applylevel"] ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="--- Please Select ---" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Account Price Plan</SelectItem>
                            <SelectItem value="S">Subscription Price Plan</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors["applylevel"] && <p className="text-red-500 text-xs mt-1">{errors["applylevel"]}</p>}
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          <span className="text-red-500">*</span> Price Plan Type
                        </label>
                        <Select
                          onOpenChange={(open) => {
                            if (open) setIsOpen(false) // ✅ kalau Select dibuka, tutup dropdown custom
                          }}
                          onValueChange={(val) =>
                            setFormField((prev: any) => ({
                              ...prev,
                              priceplantype: val,
                            }))
                          }
                          value={formField.priceplantype}
                        >
                          <SelectTrigger className={`w-full border rounded px-2 py-1 text-sm mt-1 ${errors["priceplantype"] ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="--- Please Select ---" />
                          </SelectTrigger>
                          <SelectContent>
                            {formField.applylevel === "A"
                              ? pricePlanType
                                  .filter((item: any) => item.id === "2" || item.id === "3")
                                  .map((item: any) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.pricePlanTypeName}
                                    </SelectItem>
                                  ))
                              : pricePlanType.map((item: any) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.pricePlanTypeName}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        {errors["priceplantype"] && <p className="text-red-500 text-xs mt-1">{errors["priceplantype"]}</p>}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Is Package</label>
                        <div className="flex space-x-4 mt-1">
                          <label className="flex items-center space-x-2">
                            <Input
                              type="radio"
                              name="isPackage"
                              value="Y"
                              checked={formField.ispackage === "Y"}
                              onChange={({ target }) =>
                                setFormField((prev) => ({
                                  ...prev,
                                  ispackage: target.value,
                                }))
                              }
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <Input
                              type="radio"
                              name="isPackage"
                              value="N"
                              checked={formField.ispackage === "N"}
                              onChange={({ target }) =>
                                setFormField((prev) => ({
                                  ...prev,
                                  ispackage: target.value,
                                }))
                              }
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Rule Section */}
                  <h1 className="mt-5 ml-5 text-2xl font-semibold">Order Rule</h1>
                  <div className="w-full p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium">Package Mode</label>
                        <Select
                          onValueChange={(val) =>
                            setFormField((prev) => ({
                              ...prev,
                              packagemode: val === "" ? null : val,
                            }))
                          }
                          value={formField.packagemode ?? undefined}
                          disabled={formField.ispackage !== "Y"}
                        >
                          <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                            <SelectValue placeholder="--- Please Select ---" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Single Select</SelectItem>
                            <SelectItem value="B">Multi Select</SelectItem>
                            <SelectItem value="C">Select All</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Quantity Limit</label>
                        <div className="flex space-x-4 mt-1">
                          <Input
                            className="input"
                            type="number"
                            placeholder="Quantity Limit Lower"
                            autoComplete="off"
                            value={formField.quantitylimitlower}
                            disabled={formField.packagemode !== "B"}
                            onChange={({ target }) =>
                              setFormField((prev) => ({
                                ...prev,
                                quantitylimitlower: target.value,
                              }))
                            }
                          />
                          <span>-</span>
                          <Input
                            className="input"
                            type="number"
                            placeholder="Quantity Limit Upper"
                            autoComplete="off"
                            value={formField.quantitylimitupper}
                            disabled={formField.packagemode !== "B"}
                            onChange={({ target }) =>
                              setFormField((prev) => ({
                                ...prev,
                                quantitylimitupper: target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Sale Price</label>
                        <Input
                          className="input"
                          type="number"
                          placeholder="Sale Price"
                          autoComplete="off"
                          value={formField.saleprice}
                          onChange={({ target }) =>
                            setFormField((prev) => ({
                              ...prev,
                              saleprice: target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Rent Price</label>
                        <Input
                          className="input"
                          type="number"
                          placeholder="Rent Price"
                          autoComplete="off"
                          value={formField.rentprice}
                          onChange={({ target }) =>
                            setFormField((prev) => ({
                              ...prev,
                              rentprice: target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Duplicate Order</label>
                        <Select
                          onValueChange={(val) =>
                            setFormField((prev) => ({
                              ...prev,
                              duplicateorder: val === "" ? null : val,
                            }))
                          }
                          value={formField.duplicateorder ?? undefined}
                        >
                          <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                            <SelectValue placeholder="--- Please Select ---" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Don't Allow to Duplicate Order</SelectItem>
                            <SelectItem value="B">Extend Effective period of original instance from sysdate</SelectItem>
                            <SelectItem value="C">Add Offer Instance, Don't Change Old Instance</SelectItem>
                            <SelectItem value="D">Add Offer Instance, Cancel Old Instance</SelectItem>
                            <SelectItem value="E">Extend Effective period of original instance from ExpDate</SelectItem>
                            <SelectItem value="F">Add Offer Instance, New Instance EffDate equal Old ExpDate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          <span className="text-red-500">*</span>Effective Type
                        </label>
                        <Popover open={effTypeOpen} onOpenChange={setEffTypeOpen}>
                          <PopoverTrigger asChild>
                            <button type="button" className={`w-full px-2 py-1 text-sm h-10 border rounded-md flex items-center justify-between ${errors["effectivetype"] ? "border-red-500" : "border-gray-300"}`}>
                              <span className="truncate w-[85%] text-left">
                                {selectedEffType.length === 0
                                  ? "Select Effective Type"
                                  : effectiveType
                                      .filter((item) => selectedEffType.includes(item.value))
                                      .map((item) => item.label)
                                      .join(" | ")}
                              </span>
                              <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                            </button>
                          </PopoverTrigger>

                          <PopoverContent className="w-[520px]">
                            <div className="flex flex-col gap-2">
                              {effectiveType.map((item) => (
                                <label key={item.value} className="flex items-center gap-2 text-md">
                                  <Checkbox
                                    checked={selectedEffType.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      setSelectedEffType((prev) => (checked ? [...prev, item.value] : prev.filter((val) => val !== item.value)))
                                    }}
                                  />
                                  {item.label}
                                </label>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        {errors["effectivetype"] && <p className="text-red-500 text-xs mt-1">{errors["effectivetype"]}</p>}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Order Time Limit</label>
                        <div className="flex space-x-4 mt-1">
                          <Input
                            className="input"
                            type="number"
                            placeholder="Quantity Limit Upper"
                            autoComplete="off"
                            value={formField.ordertimelimitinput ?? ""}
                            onChange={({ target }) =>
                              setFormField((prev) => ({
                                ...prev,
                                ordertimelimitinput: target.value === "" ? null : target.value,
                              }))
                            }
                          />
                          <Select
                            onValueChange={(val) =>
                              setFormField((prev) => ({
                                ...prev,
                                ordertimelimitselect: val === "" ? null : val,
                              }))
                            }
                            value={formField.ordertimelimitselect ?? undefined}
                          >
                            <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                              <SelectValue placeholder="--- Please Select ---" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Y">Year</SelectItem>
                              <SelectItem value="M">Month</SelectItem>
                              <SelectItem value="W">Week</SelectItem>
                              <SelectItem value="D">Day</SelectItem>
                              <SelectItem value="H">Hour</SelectItem>
                              <SelectItem value="C">Billing Cycle</SelectItem>
                              <SelectItem value="S">Exact Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Automatic Renewal</label>
                        <div className="flex space-x-4 mt-1">
                          <label className="flex items-center space-x-2">
                            <Input
                              type="radio"
                              name="autoRenewal"
                              value="Y"
                              checked={formField.automaticrenewal === "Y"}
                              onChange={({ target }) =>
                                setFormField((prev) => ({
                                  ...prev,
                                  automaticrenewal: target.value,
                                }))
                              }
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <Input
                              type="radio"
                              name="autoRenewal"
                              value="N"
                              checked={formField.automaticrenewal === "N"}
                              onChange={({ target }) =>
                                setFormField((prev) => ({
                                  ...prev,
                                  automaticrenewal: target.value,
                                }))
                              }
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Agreement Period</label>
                        <div className="flex space-x-4 mt-1">
                          <Input
                            className="input"
                            type="number"
                            placeholder="Agreement Period"
                            autoComplete="off"
                            value={formField.agreementperiodinput ?? ""}
                            onChange={({ target }) =>
                              setFormField((prev) => ({
                                ...prev,
                                agreementperiodinput: target.value === "" ? null : target.value,
                              }))
                            }
                          />

                          <Select
                            onValueChange={(val) =>
                              setFormField((prev) => ({
                                ...prev,
                                agreementperiodselect: val === "" ? null : val,
                              }))
                            }
                            value={formField.agreementperiodselect ?? undefined}
                          >
                            <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                              <SelectValue placeholder="--- Please Select ---" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Y">Year</SelectItem>
                              <SelectItem value="M">Month</SelectItem>
                              <SelectItem value="W">Week</SelectItem>
                              <SelectItem value="D">Day</SelectItem>
                              <SelectItem value="H">Hour</SelectItem>
                              <SelectItem value="C">Billing Cycle</SelectItem>
                              <SelectItem value="S">Exact Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Agreement Affective Type</label>
                        <div className="flex space-x-4 mt-1">
                          <Input
                            className="input"
                            type="text"
                            placeholder="Agreement Affective Type"
                            autoComplete="off"
                            value={formField.agreementaffectiveinput ?? ""}
                            onChange={({ target }) =>
                              setFormField((prev) => ({
                                ...prev,
                                agreementaffectiveinput: target.value === "" ? null : target.value,
                              }))
                            }
                          />

                          <Select
                            onValueChange={(val) =>
                              setFormField((prev) => ({
                                ...prev,
                                agreementaffectiveselect: val === "" ? null : val,
                              }))
                            }
                            value={formField.agreementaffectiveselect ?? undefined}
                          >
                            <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                              <SelectValue placeholder="--- Please Select ---" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="C">Next Day</SelectItem>
                              <SelectItem value="E">Next Month</SelectItem>
                              <SelectItem value="F">Next Billing Cycle</SelectItem>
                              <SelectItem value="4">Today 0:00</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Remarks</label>
                      <Input
                        className="input"
                        type="text"
                        placeholder="Remarks"
                        autoComplete="off"
                        value={formField.remarks ?? ""}
                        onChange={({ target }) =>
                          setFormField((prev) => ({
                            ...prev,
                            remarks: target.value === "" ? null : target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t flex justify-end items-center">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCancel()}>
                  Cancel
                </Button>
                <Button className="bg-blue-400 hover:bg-blue-500 text-white" type="submit">
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export { AddDialogSub }
