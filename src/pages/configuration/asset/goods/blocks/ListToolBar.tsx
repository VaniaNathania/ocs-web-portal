import { DefaultTooltip, KeenIcon, useDataGrid } from '@/components';
import { useGoodsContext } from '../hooks';

import { Button } from '@/components/ui/button';
import { toAbsoluteUrl } from '@/utils';
import { toast } from 'sonner';
import { useState } from 'react';

const ListToolBar = ({ setFilter }: any) => {
  const { table, reload } = useDataGrid();
  const { handleAddDialog } = useGoodsContext();
  const [code, setCode] = useState('');
  const [company, setCompany] = useState('');

  const handleReload = () => {
    reload();
  };

  const handleFilterData = () => {
    try {
      const filters = [];
      if (code != '') filters.push({ id: 'AssetGood.code', value: `%${code}%` });
      if (company != '') filters.push({ id: 'name', value: `%${company}%` });

      table.setColumnFilters(filters);
    } catch (error) {
      toast.error('Error filter data');
    }
  };

  const handleResetData = () => {
    setCode('');
    setCompany('');
    table.setColumnFilters([]);
    reload();
  };

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-end w-full items-center">
          <div className="flex justify-between w-full items-center">
            <div className="flex gap-3">
              <label className="input input-sm w-3/6">
                <KeenIcon icon="filter" />
                <input
                  type="text"
                  placeholder="Code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </label>

              <div className="flex item-center gap-3 ms-2 me-10">
                <DefaultTooltip title={'Filter'} placement={'top'}>
                  <Button variant="outline" className="h-7.5" onClick={handleFilterData}>
                    <KeenIcon icon="filter" />
                  </Button>
                </DefaultTooltip>
                <DefaultTooltip title={'Reset Filter'} placement={'top'}>
                  <Button variant="outline" className="h-7.5" onClick={handleResetData}>
                    <KeenIcon icon="arrow-circle-left" />
                  </Button>
                </DefaultTooltip>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-7.5 text-[0.8rem]"
                onClick={() => handleAddDialog(true)}
              >
                Add Data
              </Button>
              <DefaultTooltip title={'Refresh'} placement={'top'}>
                <Button variant="outline" className="h-7.5" onClick={() => reload()}>
                  <KeenIcon icon="arrows-circle" />
                </Button>
              </DefaultTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ListToolBar };
