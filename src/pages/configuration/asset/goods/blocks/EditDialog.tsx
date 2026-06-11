import { useCallback, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGoodsContext } from "../hooks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";

const API_URL = apiConfig.service_assets;

interface GoodsCategoryList {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  deleted_at: string;
  deleted_by: string;
}

interface FixedTypeList {
  code: string;
  created_at: string;
  deleted_at: string;
  id: string;
  name: string;
  status: string;
  updated_at: string;
}

const EditDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { showEditDialog, selectedGoods, handleEditDialog } = useGoodsContext();
  const { GetData } = useCallApi();
  const { reload } = useDataGrid();
  const { PutData } = useCallApi();

  const [fixedType, setFixedType] = useState<FixedTypeList[]>([]);
  const [goodsCategory, setGoodsCategory] = useState<GoodsCategoryList[]>([]);

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [formField, setFormField] = useState({
    fixedTypeId: selectedGoods?.fixed_type.id,
    goodCategoryId: selectedGoods?.good_category.id,
    price: selectedGoods?.price,
    unit: selectedGoods?.unit,
    name: selectedGoods?.name,
    code: selectedGoods?.code,
    description: selectedGoods?.description,
  });

  /* actions */
  const doUpdate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedGoods) {
        toast.error("Selected Goods is not defined");
        return;
      }
      const response = await PutData(
        `${API_URL}/config/good/update/${selectedGoods.id}`,
        formField
      );
      if (response?.status) {
        setAlert((prev) => ({ ...prev, show: false, message: "" }));
        handleEditDialog(false, null);
        toast.success("Success Update Goods");
        reload();
        const createActivity = {
          module: "Goods",
          description: `Edit Goods => ${selectedGoods.name}`,
          action: "U",
        };

        doSaveLogActivity(createActivity);
      } else {
        setAlert((prev) => ({
          ...prev,
          show: true,
          message: response?.message,
        }));
      }
    },
    [selectedGoods, formField]
  );

  useEffect(() => {
    if (selectedGoods) {
      setFormField((prev) => ({
        ...prev,
        fixedTypeId: selectedGoods?.fixed_type.id,
        goodCategoryId: selectedGoods?.good_category.id,
        price: selectedGoods?.price,
        unit: selectedGoods?.unit,
        name: selectedGoods?.name,
        code: selectedGoods?.code,
        description: selectedGoods?.description,
      }));
    }
  }, [selectedGoods]);

  useEffect(() => {
    const fetchGoodsCategory = async () => {
      try {
        const response = await GetData(`${API_URL}/config/good-category/list`, {
          limit: 100,
          page: 1,
          with_deleted: false,
          order_field: "created_at",
          order_direction: "ASC",
          filter: "{}",
        });

        if (response && response.data) {
          setGoodsCategory(response.data.list);
        }
      } catch (error) {
        toast.error("Error Fetching Data.Please Check Your Connection!");
      }
    };

    const fetchFixedType = async () => {
      try {
        const response = await GetData(`${API_URL}/config/fixed-type/list`, {
          limit: 100,
          page: 1,
          with_deleted: false,
          order_field: "created_at",
          order_direction: "ASC",
          filter: "{}",
        });
        if (response && response.data) {
          setFixedType(response.data.list);
        }
      } catch (error) {
        toast.error("Error loading Fixed type data");
      }
    };
    fetchGoodsCategory();
    fetchFixedType();
  }, []);

  return (
    <Dialog
      open={showEditDialog}
      onOpenChange={(open) => handleEditDialog(open, null)}
    >
      <DialogContent className="container-fixed max-w-[720px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Goods - Update
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <Button
              variant={"outline"}
              color="#ddd"
              size={"sm"}
              onClick={() => handleEditDialog(false, null)}
              className="btn btn-sm btn-clear btn-light px-0 py-0"
            >
              <KeenIcon icon="cross" className="text-3sm" />
            </Button>
          </div>
        </DialogHeader>
        <DialogBody className="scrollable-y px-0 pb-0" ref={parentRef}>
          <div className="flex flex-col px-0">
            {alert.show && (
              <Alert variant="danger">
                <h3>{alert.message}</h3>
              </Alert>
            )}
            <form onSubmit={doUpdate}>
              <div className="card-body p-0">
                <h2 className="font-semibold mb-2">Goods Information</h2>
                <div className="grid gap-5 mb-5">
                  <div className="flex gap-5">
                    <div className="w-8/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Name Goods
                        </label>
                        <Input
                          className="input"
                          type="text"
                          value={formField.name}
                          onChange={({ target }) =>
                            setFormField((prev) => ({
                              ...prev,
                              name: target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="w-4/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Code Goods
                        </label>
                        <Input
                          className="input"
                          type="text"
                          value={formField.code}
                          onChange={({ target }) =>
                            setFormField((prev) => ({
                              ...prev,
                              code: target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-6/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Price
                        </label>
                        <div className="relative mb-6">
                          <div className="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-500 dark:text-gray-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              {" "}
                              <line x1="12" y1="1" x2="12" y2="23" />{" "}
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          </div>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={formField.price}
                            onChange={({ target }) =>
                              setFormField((prev) => ({
                                ...prev,
                                price: target.value
                                  ? parseFloat(target.value)
                                  : undefined,
                              }))
                            }
                            className="input ps-6"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-6/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Unit
                        </label>
                        <Input
                          className="input"
                          type="text"
                          value={formField.unit}
                          onChange={({ target }) =>
                            setFormField((prev) => ({
                              ...prev,
                              unit: target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-3/3">
                    <div className="items-baseline lg:flex-nowrap gap-5">
                      <label className="form-label flex items-center gap-1 mb-2">
                        Fixed Type
                      </label>
                      <div className="grow">
                        <Select
                          value={formField.fixedTypeId}
                          onValueChange={(fixedTypeId) =>
                            setFormField((prev) => ({ ...prev, fixedTypeId }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {fixedType.map((fixedType) => (
                              <SelectItem
                                key={fixedType.id}
                                value={fixedType.id}
                              >
                                {fixedType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="w-3/3">
                    <div className="items-baseline lg:flex-nowrap gap-5">
                      <label className="form-label flex items-center gap-1 mb-2">
                        Goods Category
                      </label>
                      <div className="grow">
                        <Select
                          value={formField.goodCategoryId}
                          onValueChange={(goodCategoryId) =>
                            setFormField((prev) => ({
                              ...prev,
                              goodCategoryId,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {goodsCategory.map((goods) => (
                              <SelectItem key={goods.id} value={goods.id}>
                                {goods.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="w-3/3">
                    <div className="items-baseline lg:flex-nowrap gap-5">
                      <label className="form-label flex items-center gap-1 mb-2">
                        Description
                      </label>
                      <Textarea
                        className="input focus-visible:ring-offset-0 focus-visible:ring-0"
                        value={formField.description}
                        onChange={({ target }) =>
                          setFormField((prev) => ({
                            ...prev,
                            description: target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2.5">
                  <Button className="btn btn-primary">Save Changes</Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { EditDialog };
