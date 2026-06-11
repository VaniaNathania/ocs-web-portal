import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useSupplierContext } from '../hooks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { apiConfig } from '@/config/api.config';
import { Alert, KeenIcon, useDataGrid } from '@/components';
import { toast } from 'sonner';
import { useCallApi } from '@/hooks';
import { doSaveLogActivity } from '@/actions/GlobalActions';

const API_URL = apiConfig.service_assets;

const EditDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { showEditDialog, selectedSupplier, handleEditDialog } = useSupplierContext();
  const { GetData } = useCallApi();
  const { reload } = useDataGrid();
  const { PutData } = useCallApi();

  const [alert, setAlert] = useState({
    show: false,
    message: ''
  });

  const [formField, setFormField] = useState({
    code: selectedSupplier?.code,
    name: selectedSupplier?.name,
    address: selectedSupplier?.address,
    pic_name: selectedSupplier?.pic_name,
    pic_phone: selectedSupplier?.pic_phone,
    pic_email: selectedSupplier?.pic_email,
    status: selectedSupplier?.status
  });

  /* actions */
  const doUpdate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedSupplier) {
        toast.error('Selected Supplier is not defined');
        return;
      }
      const response = await PutData(
        `${API_URL}/config/supplier/update/${selectedSupplier.id}`,
        formField
      );
      if (response?.status) {
        setAlert((prev) => ({ ...prev, show: false, message: '' }));
        handleEditDialog(false, null);
        toast.success('Success Update Supplier');
        reload();
        const createActivity = {
          module: 'Supplier',
          description: `Edit Supplier => ${selectedSupplier.name}`,
          action: 'U'
        };

        doSaveLogActivity(createActivity);
      } else {
        setAlert((prev) => ({ ...prev, show: true, message: response?.message }));
      }
    },
    [selectedSupplier, formField]
  );

  useEffect(() => {
    if (selectedSupplier) {
      setFormField((prev) => ({
        ...prev,

        code: selectedSupplier?.code,
        name: selectedSupplier?.name,
        address: selectedSupplier?.address,
        pic_name: selectedSupplier?.pic_name,
        pic_phone: selectedSupplier?.pic_phone,
        pic_email: selectedSupplier?.pic_email,
        status: selectedSupplier?.status
      }));
    }
  }, [selectedSupplier]);

  return (
    <Dialog open={showEditDialog} onOpenChange={(open) => handleEditDialog(open, null)}>
      <DialogContent className="container-fixed max-w-[720px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Supplier - Update
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <Button
              variant={'outline'}
              color="#ddd"
              size={'sm'}
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
                <h2 className="font-semibold mb-2">Supplier Information</h2>
                <div className="grid gap-5 mb-5">
                  <div className="flex gap-5">
                    <div className="w-6/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Supplier Code
                        </label>
                        <Input
                          className="input"
                          type="text"
                          value={formField.code}
                          onChange={({ target }) =>
                            setFormField((prev) => ({ ...prev, code: target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="w-6/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Supplier Name
                        </label>
                        <Input
                          className="input"
                          type="text"
                          value={formField.name}
                          onChange={({ target }) =>
                            setFormField((prev) => ({ ...prev, name: target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-6/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">PIC Name</label>
                        <input
                          type="text"
                          id="pic_name"
                          name="pic_name"
                          value={formField.pic_name}
                          onChange={({ target }) =>
                            setFormField((prev) => ({ ...prev, pic_name: target.value }))
                          }
                          className="input"
                        />
                      </div>
                    </div>
                    <div className="w-6/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">PIC Phone</label>
                        <Input
                          className="input"
                          type="number"
                          value={formField.pic_phone}
                          onChange={({ target }) =>
                            setFormField((prev) => ({ ...prev, pic_phone: target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="w-6/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">PIC Email</label>
                        <Input
                          className="input"
                          type="email"
                          value={formField.pic_email}
                          onChange={({ target }) =>
                            setFormField((prev) => ({ ...prev, pic_email: target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-6/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">Status</label>
                        <Select
                          value={formField.status}
                          onValueChange={(status) => setFormField((prev) => ({ ...prev, status }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Active</SelectItem>
                            <SelectItem value="N">Non Active</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="w-3/3">
                    <div className="items-baseline lg:flex-nowrap gap-5">
                      <label className="form-label flex items-center gap-1 mb-2">Address</label>
                      <Textarea
                        className="input focus-visible:ring-offset-0 focus-visible:ring-0"
                        value={formField.address}
                        onChange={({ target }) =>
                          setFormField((prev) => ({ ...prev, address: target.value }))
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
