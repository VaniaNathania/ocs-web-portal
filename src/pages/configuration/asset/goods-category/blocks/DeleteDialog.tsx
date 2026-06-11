import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { useGoodsCategoryContext } from '../hooks';
import { Button } from '@/components/ui/button';
import { Alert, useDataGrid } from '@/components';
import { useCallback, useState } from 'react';
import { apiConfig } from '@/config/api.config';
import { toast } from 'sonner';
import { useCallApi } from '@/hooks';
import { doSaveLogActivity } from '@/actions/GlobalActions';

const API_URL = apiConfig.service_assets;
const DeleteDialog = () => {
  const { showDeleteDialog, handleDeleteDialog, selectedGoodsCategory } = useGoodsCategoryContext();
  const { reload } = useDataGrid();

  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: ''
  });

  /* actions */
  const doDeleteData = useCallback(async () => {
    if (!selectedGoodsCategory) {
      toast.error('Selected branch is not defined');
      return;
    }
    const response = await DeleteData(
      `${API_URL}/config/good-category/delete/${selectedGoodsCategory.id}/true`,
      {
        id: selectedGoodsCategory.id
      }
    );
    if (response?.status) {
      setAlert((prev) => ({ ...prev, show: false, message: '' }));
      handleDeleteDialog(false, null);
      toast.success('Success Delete Goods Category');
      reload();
      const createActivity = {
        module: 'Goods Category',
        description: `Delete Goods Category => ${selectedGoodsCategory.name}`,
        action: 'D'
      };
      doSaveLogActivity(createActivity);
    } else {
      setAlert((prev) => ({ ...prev, show: true, message: response?.message }));
    }
  }, [selectedGoodsCategory]);

  return (
    <Dialog open={showDeleteDialog} onOpenChange={(open) => handleDeleteDialog(open, null)}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">you will delete this data!</span>
          </Alert>
          {alert.show && (
            <Alert variant="danger">
              <h3>{alert.message}</h3>
            </Alert>
          )}
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant={'outline'} onClick={() => handleDeleteDialog(false, null)}>
            Cancel
          </Button>
          <Button variant={'destructive'} onClick={() => doDeleteData()}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteDialog };
