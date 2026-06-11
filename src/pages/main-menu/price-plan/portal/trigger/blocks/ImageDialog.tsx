import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert, KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiConfig } from '@/config/api.config';
import { useCallApi } from '@/hooks';
import { toast } from 'sonner';

const API_URL = apiConfig.service_assets;

const ImageDialog = ({ showAddDialog, setShowAddDialog, setFormData, formData }: any) => {
  const parentRef = useRef<any | null>(null);
  const { GetData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: ''
  });

  const handleImageDialogClose = () => {
    setShowAddDialog(false);
  };

  return (
    <Dialog open={showAddDialog} onOpenChange={(open) => setShowAddDialog(open)}>
      <DialogContent className="container-fixed min-w-[1000px] border-none shadow-none bg-opacity-10 bg-gray-0 flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow">
            <Button
              variant={'outline'}
              color="#ddd"
              size={'sm'}
              onClick={handleImageDialogClose}
              className="btn btn-sm btn-clear btn-light px-0 py-0"
            >
              <KeenIcon icon="cross" className="text-sm" />
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
            <form action="">
              <div className="card-body p-0">
                <div className="grid gap-5 mb-5">
                  <div className="">
                    <div className="items-baseline lg:flex-nowrap gap-5">
                      {formData.file && (
                        <img
                          src={formData.file}
                          className="w-full h-auto cursor-pointer mx-auto"
                          alt=""
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ImageDialog };
