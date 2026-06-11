import { DefaultTooltip, KeenIcon, useDataGrid } from '@/components';
import { useUserContext } from '../hooks';
import { Button } from '@/components/ui/button';

const ListToolBar = () => {
  const { table, reload } = useDataGrid();
  const { handleAddDialog } = useUserContext();

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-between w-full items-center">
          <div className="flex w-[50%] gap-3 items-center">
            <label className="input input-sm w-1/3">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search users"
                value={(table.getColumn('username')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('username')?.setFilterValue(event.target.value)
                }
              />
            </label>
            <DefaultTooltip title={'Filter'} placement={'top'}>
              <Button
                variant="outline"
                className="h-7.5 disabled:bg-gray-400"
                // disabled={isLoading}
                // onClick={handleFilterData}
              >
                {/* {loadingButton === 'filter' ? <ContentLoader /> : <KeenIcon icon="filter" />} */}
                <KeenIcon icon="filter" />
              </Button>
            </DefaultTooltip>
          </div>
          <div className="flex gap-3 items-center">
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
