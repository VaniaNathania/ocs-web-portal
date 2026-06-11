import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { apiConfig } from '@/config/api.config';
import { Toaster } from '@/components/ui/sonner';
import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from '@/components';
import { EnforceSwitch } from '@/components/switch';
import { ListToolBar } from '../blocks/ListToolBar';
import { useCallApi } from '@/hooks';
import moment from 'moment';
import { snakeToTitleCase, toCamelCase } from '@/utils';
import { IconButton } from '@mui/material';

interface ContextProps {
  showEditDialog: boolean;
  handleEditDialog: (
    show: boolean,
    selectedRequestOrderCategory: SelectedRequestOrderCategory | null
  ) => void;
  showAddDialog: boolean;
  handleAddDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  handleDeleteDialog: (
    show: boolean,
    selectedRequestOrderCategory: SelectedRequestOrderCategory | null
  ) => void;
  selectedRequestOrderCategory: SelectedRequestOrderCategory | null;
}

interface SelectedRequestOrderCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  type: string;
  pic_name: string;
  pic_email: string;
  pic_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const initialProps: ContextProps = {
  showEditDialog: false,
  handleEditDialog: () => {},
  showAddDialog: false,
  handleAddDialog: () => {},
  showDeleteDialog: false,
  handleDeleteDialog: () => {},
  selectedRequestOrderCategory: null
};

const RequestOrderCategoryContext = createContext<ContextProps>(initialProps);

const API_URL = apiConfig.service_assets;

const RequestOrderCategoryContextProvider = ({ children }: { children: React.ReactNode }) => {
  /* state */
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRequestOrderCategory, setSelectedRequestOrderCategory] =
    useState<SelectedRequestOrderCategory | null>(null);
  const { GetData } = useCallApi();

  /* action */
  const handleEditDialog = useCallback(
    (show: boolean, selected_branch: SelectedRequestOrderCategory | null) => {
      setSelectedRequestOrderCategory(show ? selected_branch : null);
      setShowEditDialog(show);
    },
    []
  );

  const handleAddDialog = useCallback((show: boolean) => {
    setShowAddDialog(show);
  }, []);

  const handleDeleteDialog = useCallback(
    (show: boolean, selected_branch: SelectedRequestOrderCategory | null) => {
      setSelectedRequestOrderCategory(show ? selected_branch : null);
      setShowDeleteDialog(show);
    },
    []
  );

  /* Data Grid Options */
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.code,
        id: 'code',
        header: ({ column }) => <DataGridColumnHeader title="Code" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: 'w-1/12'
        }
      },
      {
        accessorFn: (row) => row.name,
        id: 'name',
        header: ({ column }) => <DataGridColumnHeader title="Name" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: 'w-3/12'
        }
      },
      {
        accessorFn: (row) => row.finalize_by,
        id: 'finalize_by',
        header: ({ column }) => <DataGridColumnHeader title="Created by" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: 'w-1/12 text-center',
          cellClassName: 'text-center'
        },
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <>
              <p>{String(snakeToTitleCase(data.row.original.created_by || '')).toUpperCase()}</p>
              <p className="text-[12px] whitespace-nowrap">
                <em>{moment(data.row.original.created_at).format('DD-MM-YYYY HH:mm:ss')}</em>
              </p>
            </>
          );
        }
      },
      // {
      //   accessorFn: (row) => row.status,
      //   id: 'status',
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Status" className="text-center" column={column} />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      //   cell: ({ row }) => {
      //     return (
      //       <EnforceSwitch
      //         enforce={row.original.status == 'Y' ? true : false}
      //         onChange={() => {}}
      //       />
      //     );
      //   },
      //   meta: {
      //     headerClassName: 'w-1/12',
      //     cellClassName: 'text-center'
      //   }
      // },
      {
        id: 'actions',
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" className="text-center" column={column} />
        ),
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <DefaultTooltip title={'Edit Fixed Classification'} placement={'top'}>
                <IconButton onClick={() => handleEditDialog(true, row)} color="primary">
                  <i className="ki-solid ki-notepad-edit text-base leading-none"></i>
                </IconButton>
              </DefaultTooltip>
              <DefaultTooltip title={'Delete Fixed Classification'} placement={'top'}>
                <IconButton onClick={() => handleDeleteDialog(true, row)} color="error">
                  <i className="ki-solid ki-trash text-base leading-none"></i>
                </IconButton>
              </DefaultTooltip>
            </div>
          );
        },
        meta: {
          headerClassName: 'w-1/12',
          cellClassName: 'text-center'
        }
      }
    ],
    [handleEditDialog, handleDeleteDialog]
  );

  const doGetListData = async (page: number, limit: number, sorting: any, filter: any) => {
    sorting = sorting.length == 0 ? [{ id: 'created_at', desc: false }] : sorting;

    filter = filter?.length === 0 ? {} : filter;
    let filterObject: Record<string, string | string[]> = {};
    if (Object.keys(filter).length !== 0) {
      for (let _filter of filter) {
        filterObject[_filter.id] = _filter.value;
      }
    }

    filter = filterObject;

    const response = await GetData(`${API_URL}/config/request-order-category/list`, {
      limit: limit,
      page: page + 1,
      with_deleted: false,
      order_field: sorting[0].id,
      order_direction: sorting[0].desc == false ? 'DESC' : 'ASC',
      filter: JSON.stringify(filter)
    });

    return { data: response?.data.list, totalCount: response?.data.total_count };
  };

  return (
    <RequestOrderCategoryContext.Provider
      value={{
        showEditDialog,
        handleEditDialog,
        selectedRequestOrderCategory,
        showAddDialog,
        handleAddDialog,
        showDeleteDialog,
        handleDeleteDialog
      }}
    >
      <Toaster expand visibleToasts={9} duration={3000} />

      <DataGridProvider
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: 'created_at', desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListData(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
      </DataGridProvider>
    </RequestOrderCategoryContext.Provider>
  );
};

export { RequestOrderCategoryContextProvider, RequestOrderCategoryContext };
export type { SelectedRequestOrderCategory };
