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
import { useRequestOrderCategoryContext } from '../hooks';

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
  const { showEditDialog, selectedRequestOrderCategory, handleEditDialog } =
    useRequestOrderCategoryContext();
  const { reload } = useDataGrid();
  const { PutData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: ''
  });

  const [formField, setFormField] = useState({
    name: selectedRequestOrderCategory?.name,
    code: selectedRequestOrderCategory?.code,
    description: selectedRequestOrderCategory?.description
  });

  /* actions */
  const doUpdate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedRequestOrderCategory) {
        toast.error('Selected RequestOrderCategory is not defined');
        return;
      }
      const response = await PutData(
        `${API_URL}/config/request-order-category/update/${selectedRequestOrderCategory.id}`,
        formField
      );
      if (response?.status) {
        setAlert((prev) => ({ ...prev, show: false, message: '' }));
        handleEditDialog(false, null);
        toast.success('Success Update RequestOrderCategory');
        reload();
        const createActivity = {
          module: 'RequestOrderCategory',
          description: `Edit Insansi => ${selectedRequestOrderCategory.name}`,
          action: 'U'
        };

        doSaveLogActivity(createActivity);
      } else {
        setAlert((prev) => ({ ...prev, show: true, message: response?.message }));
      }
    },
    [selectedRequestOrderCategory, formField]
  );

  useEffect(() => {
    if (selectedRequestOrderCategory) {
      setFormField((prev) => ({
        ...prev,
        name: selectedRequestOrderCategory?.name,
        code: selectedRequestOrderCategory?.code
      }));
    }
  }, [selectedRequestOrderCategory]);

  return (
    <Dialog open={showEditDialog} onOpenChange={(open) => handleEditDialog(open, null)}>
      <DialogContent className="container-fixed max-w-[720px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Request Order Category - Update
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
                <h2 className="font-semibold mb-2">Request Order Category Information</h2>
                <div className="grid gap-5 mb-5">
                  <div className="flex gap-5">
                    <div className="w-8/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Name Request Order Category
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
                    <div className="w-4/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Code Request Order Category
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
