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
import { useFixedClassificationContext } from '../hooks';
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
  const { showAddDialog, handleAddDialog } = useFixedClassificationContext();
  const { reload } = useDataGrid();
  const { PostData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: ''
  });

  const initialState = {
    name: '',
    code: '',
    description: ''
  };

  const [formField, setFormField] = useState(initialState);

  const resetForm = () => {
    setFormField(initialState);
  };
  /* actions */
  const doCreate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const response = await PostData(`${API_URL}/config/fixed-classification/create`, formField);
      if (response?.status) {
        setAlert((prev) => ({ ...prev, show: false, message: '' }));
        handleAddDialog(false);
        toast.success('Success Create Fixed Classification');
        reload();
        const createActivity = {
          module: 'Fixed Classification',
          description: `Add Fixed Classification => ${formField.name}`,
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
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Add Fixed Classification
              </h1>
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
                <h2 className="font-semibold mb-2">Fixed Classification Information</h2>
                <div className="grid gap-5 mb-5">
                  <div className="flex gap-5">
                    <div className="w-8/12">
                      <div className="items-baseline lg:flex-nowrap gap-5">
                        <label className="form-label flex items-center gap-1 mb-2">
                          Name Fixed Classification
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
                          Code Fixed Classification
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
                  <div className="w-3/3">
                    <div className="items-baseline lg:flex-nowrap gap-5">
                      <label className="form-label flex items-center gap-1 mb-2">description</label>
                      <Textarea
                        className="input focus-visible:ring-offset-0 focus-visible:ring-0"
                        value={formField.description}
                        onChange={({ target }) =>
                          setFormField((prev) => ({ ...prev, description: target.value }))
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
