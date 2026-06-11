import React, { createContext, useCallback, useMemo, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { Toaster } from "@/components/ui/sonner";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ListToolBar } from "../blocks";
import { useCallApi } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { getAuth } from "@/auth";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { doSaveLogActivity } from "@/actions/GlobalActions";

interface ContextProps {
  doExportData: (sorting: any, filter: any) => Promise<any>;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

const initialProps: ContextProps = {
  doExportData: async () => ({ data: [], totalCount: 0 }),
  date: undefined,
  setDate: () => {},
};

const LogActivityContext = createContext<ContextProps>(initialProps);

const API_URL = apiConfig.service_price_plan;

const LogActivityContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /* state */
  const { GetData } = useCallApi();
  const { GetExportData } = useCallApi();

  /* action */
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  /* Data Grid Options */
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.created_at,
        id: "created_at",
        header: ({ column }) => (
          <DataGridColumnHeader title="Timestamp" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) =>
          moment(row.original.created_at).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        accessorFn: (row) => row.user.username,
        id: "username",
        header: ({ column }) => (
          <DataGridColumnHeader title="Username" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-[350px]",
        },
      },
      {
        accessorFn: (row) => row.module,
        id: "module",
        header: ({ column }) => (
          <DataGridColumnHeader title="Module" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-[350px]",
        },
      },
      {
        accessorFn: (row) => row.description,
        id: "description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-[350px]",
        },
      },
      {
        accessorFn: (row) => row.action,
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const { action } = row.original;
          const statusMap: any = {
            C: ["Create", "success"],
            U: ["Update", "default"],
            D: ["Delete", "destructive"],
            l: ["Login", "outline"],
            O: ["Logout", "outline"],
            E: ["Export", "outline"],
          };

          return (
            <Badge variant={statusMap[action][1]}>{statusMap[action][0]}</Badge>
          );
        },
        meta: {
          headerClassName: "w-[100px]",
          cellClassName: "text-center",
        },
      },
    ],
    [],
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      const auth = getAuth();
      let all_user = false;
      // if (auth) {
      //   all_user = auth.role_name === "Super Admin Assets";
      // }

      const user = localStorage.getItem("brillian-bri-tl-auth-v1=9.1.1");
      const parsedUser = user ? JSON.parse(user) : null;
      const desc = sorting.length > 0 ? sorting[0].desc : false;

      sorting = [{ id: "user_activity.created_at", desc }];

      let dataFilter: any = {
        application: "edc",
      };

      if (filter && filter.length > 0) {
        filter.forEach((f: any) => {
          if (f.id === "username") {
            dataFilter["username"] = { like: f.value };
          } else if (f.id === "user_activity.created_at") {
            dataFilter["user_activity.created_at"] = f.value;
          }
        });
      }

      if (!dataFilter["user_activity.created_at"]) {
        const defaultFrom =
          date?.from ||
          new Date(new Date().setMonth(new Date().getMonth() - 1));
        const defaultTo = date?.to || new Date();

        dataFilter["user_activity.created_at"] = {
          from: `${format(defaultFrom, "yyyy-MM-dd")} 00:00:00`,
          to: `${format(defaultTo, "yyyy-MM-dd")} 23:59:59`,
        };
      }

      const response = await GetData(`${API_URL}/user_activity/list`, {
        limit: limit,
        page: page + 1,
        with_deleted: false,
        order_field: sorting[0].id,
        order_direction: sorting[0].desc === false ? "ASC" : "DESC",
        filter: JSON.stringify(dataFilter),
        token: parsedUser?.access_token,
        all_user,
      });

      return {
        data: response?.data.list,
        totalCount: response?.data.total_count,
      };
    },
    [],
  );

  const doExportData = async (sorting: any, filter: any) => {
    const auth = getAuth();
    let all_user = false;
    // if (auth) {
    //   all_user = auth.role_name === "Super Admin Assets" ? true : false;
    // }
    const user = localStorage.getItem("brillian-bri-tl-auth-v1=9.1.1");
    const parsedUser = user ? JSON.parse(user) : null;
    sorting =
      sorting.length === 0
        ? [{ id: "user_activity.created_at", desc: false }]
        : sorting;
    filter = filter && filter.length > 0 ? filter : [];

    let dataFilter: any = {
      application: "edc",
    };

    if (filter && filter.length > 0) {
      filter.forEach((f: any) => {
        if (f.id === "username") {
          dataFilter["username"] = { like: f.value };
        } else if (f.id === "user_activity.created_at") {
          dataFilter["user_activity.created_at"] = f.value;
        }
      });
    }

    if (!dataFilter["user_activity.created_at"]) {
      const defaultFrom = new Date(
        new Date().setMonth(new Date().getMonth() - 1),
      );
      const defaultTo = new Date();

      dataFilter["user_activity.created_at"] = {
        from: `${format(defaultFrom, "yyyy-MM-dd")} 00:00:00`,
        to: `${format(defaultTo, "yyyy-MM-dd")} 23:59:59`,
      };
    }
    let order = "user_activity.created_at";
    let param = {
      all_user: all_user,
      // order_field: sorting[0].id,
      order_field: order,
      order_direction: sorting[0].desc === false ? "ASC" : "DESC",
      filter: JSON.stringify(dataFilter),
      token: parsedUser?.access_token,
    };
    //  console.log("param:", param);

    let url = `${API_URL}/user_activity/export`;

    GetExportData(url, param, "user_activity_export_");

    const createActivity = {
      module: "Update Bank Garansi",
      description: `Export Bank Garansi => Log Activity`,
      action: "E",
    };
    doSaveLogActivity(createActivity);
  };

  return (
    <LogActivityContext.Provider
      value={{
        date,
        setDate,
        doExportData,
      }}
    >
      <Toaster expand visibleToasts={9} duration={3000} />

      <DataGridProvider
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ListToolBar />}
        layout={{ card: true }}
        sorting={[{ id: "UserActivity.created_at", desc: true }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListData(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
      </DataGridProvider>
    </LogActivityContext.Provider>
  );
};

export { LogActivityContextProvider, LogActivityContext };
