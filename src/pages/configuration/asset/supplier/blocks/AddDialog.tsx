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
import { Button } from '@/components/ui/button';
import { apiConfig } from '@/config/api.config';
import { Alert, KeenIcon, useDataGrid } from '@/components';
import { toast } from 'sonner';
import { useCallApi } from '@/hooks';
import { doSaveLogActivity } from '@/actions/GlobalActions';
import { Textarea } from '@/components/ui/textarea';

const API_URL = apiConfig.service_assets;

const AddDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { showAddDialog, handleAddDialog } = useSupplierContext();
  const { GetData } = useCallApi();
  const { reload } = useDataGrid();
  const { PostData } = useCallApi();

  const [alert, setAlert] = useState({
    show: false,
    message: ''
  });

  const initialState = {
    code: '',
    name: '',
    address: '',
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    status: ''
  };

  const [formField, setFormField] = useState(initialState);

  const resetForm = () => {
    setFormField(initialState);
  };
  /* actions */
  const doCreate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const response = await PostData(`${API_URL}/config/supplier/create`, formField);
      if (response?.status) {
        setAlert((prev) => ({ ...prev, show: false, message: '' }));
        handleAddDialog(false);
        toast.success('Success Create Supplier');
        reload();
        const createActivity = {
          module: 'Supplier',
          description: `Add Supplier => ${formField.name}`,
          action: 'C'
        };

        doSaveLogActivity(createActivity);

        resetForm();
      } else {
        setAlert((prev) => ({ ...prev, show: true, message: response?.message }));
      }
    },
    [formField]
  );

  return (
    <Dialog open={showAddDialog} onOpenChange={(open) => handleAddDialog(open)}>
      <DialogContent className="container-fixed max-w-[720px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">Add Supplier</h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <Button
              variant={'outline'}
              color="#ddd"
              size={'sm'}
              onClick={() => handleAddDialog(false)}
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
            <form action="" onSubmit={doCreate}>
              <div className="card-body p-0">
                <h2 className="font-semibold mb-2">Supplier Information</h2>
                <div className="grid gap-5 my-5">
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
                  <Button className="btn btn-primary" type="submit">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddDialog };
