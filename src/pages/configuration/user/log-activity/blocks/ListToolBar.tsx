import { ContentLoader, DefaultTooltip, KeenIcon, useDataGrid } from '@/components';
import { Button } from '@/components/ui/button';
import { useLogActivityContext } from '../hooks';
import { toAbsoluteUrl } from '@/utils';
import { DateRangePicker } from './DateRangePicker';
import { toast } from 'sonner';
import { useCallback, useState } from 'react';
import { DateRange } from 'react-day-picker';
import moment from 'moment';

type LoadingButton = 'filter' | 'reset' | 'export' | 'refresh' | null;

const ListToolBar = () => {
  const { table, reload } = useDataGrid();
  const { date, setDate, doExportData } = useLogActivityContext();
  const [searchUsername, setSearchUsername] = useState('');
  // const [filteredDate, setFilteredDate] = useState<DateRange | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);

  const [filter, setFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
    type?: string;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
    type: ''
  });

  const handleExport = () => {
    const sorting = table.getState().sorting;
    doExportData(sorting, table.getState().columnFilters);
  };

  const handleFilterData = useCallback(() => {
    try {
      setIsLoading(true);
      setLoadingButton('filter');
      const filters = [];

      if (searchUsername) {
        filters.push({
          id: 'username',
          value: searchUsername
        });
      }

      if (date?.from) {
        if (date?.to) {
          filters.push({
            id: 'user_activity.created_at',
            value: {
              from: moment(date.from).format('YYYY-MM-DD') + ' 00:00:00',
              to: moment(date.to).format('YYYY-MM-DD') + ' 23:59:59'
            }
          });
        } else {
          filters.push({
            id: 'user_activity.created_at',
            value: {
              from: moment(date.from).format('YYYY-MM-DD') + ' 00:00:00',
              to: moment(date.from).format('YYYY-MM-DD') + ' 23:59:59'
            }
          });
        }
      }

      table.setColumnFilters(filters);
    } catch (error) {
      toast.error('Error filtering data');
    } finally {
      setLoadingButton(null);
      setIsLoading(false);
    }
  }, [date, searchUsername, table]);

  const handleResetData = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 31);

    setDate({ from: oneMonthAgo, to: today });
    setFilter({
      from: oneMonthAgo,
      to: today,
      type: ''
    });
    setSearchUsername('');
    table.setColumnFilters([]);
    reload();
  };

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-between w-full items-center">
          <div className="flex gap-3 items-center">
            <div className="w-auto min-w-[120px]">
              <label className="input input-sm">
                <KeenIcon icon="magnifier" />
                <input
                  type="text"
                  placeholder="Search username"
                  value={searchUsername}
                  onChange={(event) => setSearchUsername(event.target.value)}
                />
              </label>
            </div>
            <div className="w-auto min-w-[220px]">
              <DateRangePicker date={date} setDate={setDate} />
            </div>
            <DefaultTooltip title={'Filter'} placement={'top'}>
              <Button
                variant="outline"
                className="h-7.5 disabled:bg-gray-400"
                disabled={isLoading}
                onClick={handleFilterData}
              >
                {loadingButton === 'filter' ? <ContentLoader /> : <KeenIcon icon="filter" />}
              </Button>
            </DefaultTooltip>
            <DefaultTooltip title={'Reset Filter'} placement={'top'}>
              <Button
                variant="outline"
                className="h-7.5 disabled:bg-gray-400"
                onClick={handleResetData}
                disabled={isLoading}
              >
                <KeenIcon icon="arrow-circle-left" />
              </Button>
            </DefaultTooltip>
          </div>

          <div className="flex gap-3">
            <DefaultTooltip title={'Refresh'} placement={'top'}>
              <Button variant={'outline'} className="h-7.5" onClick={() => reload()}>
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
            <DefaultTooltip title={'Export Data'} placement={'top'}>
              <Button onClick={handleExport} className="h-7.5" variant={'outline'}>
                <img
                  src={toAbsoluteUrl('/media/file-types/xls.svg')}
                  className="dark:hidden h-5"
                  alt="Export to Excel"
                />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ListToolBar };
