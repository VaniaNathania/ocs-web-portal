import { DefaultTooltip, KeenIcon, useDataGrid } from '@/components';
import { useManagePositionContext } from '../hooks';
import { Button } from '@/components/ui/button';

const ListToolBar = () => {
  const { table, reload } = useDataGrid();
  const { handleAddDialog } = useManagePositionContext();

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-between w-full items-center">
          <label className="input input-sm w-1/6">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Search roles"
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            />
          </label>

          <div className="flex gap-3">
            <DefaultTooltip title={'Add Data'} placement={'top'}>
              <Button variant={'outline'} onClick={() => handleAddDialog(true)}>
                <KeenIcon icon="plus" />
              </Button>
            </DefaultTooltip>
            <DefaultTooltip title={'Refresh'} placement={'top'}>
              <Button variant={'outline'} onClick={() => reload()}>
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ListToolBar };
