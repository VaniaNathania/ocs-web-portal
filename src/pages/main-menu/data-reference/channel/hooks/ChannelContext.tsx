import {
  createContext,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { DataGridProvider } from "@/components";
import { ColumnChannel } from "./ColumnChannel";
import { any } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ContactChannelPayload,
  contactChannelSchema,
  createDefaultContactChannelPayload,
} from "../types/forms";
import { ListToolbar } from "../blocks/Listtoolbar";
import ChannelForm from "../blocks/Dialog";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface ContextProps {
  showDialog: { show: boolean; mode: "create" | "update" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    selectedContactChannel: ChannelContactList | null,
  ) => void;
  handleRefresh: () => void;
  contactChannel: ChannelContactList[] | null;
  selectedContactChannel: ChannelContactList | null;
  setSelectedContactChannel: (
    contactChannel: ChannelContactList | null,
  ) => void;
  channelType: ChannelType[] | null;
  menuPrivAccess: menuAccess;
}

const initialProps: ContextProps = {
  contactChannel: null,
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  handleRefresh: () => {},
  selectedContactChannel: null,
  setSelectedContactChannel: () => {},
  channelType: null,
  menuPrivAccess: {
    addStatus: false,
    deleteStatus: false,
    editStatus: false,
    readStatus: false,
  },
};

const API_URL_REF = apiConfigRef.ref;

const ChannelContext = createContext<ContextProps>(initialProps);

const ChannelContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { checkMenusPriv } = useRoleCheck();
  const { GetData } = useCallApi();

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/data-reference/channel/Channel",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/data-reference/channel/Channel",
      "editStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/data-reference/channel/Channel",
      "deleteStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/data-reference/channel/Channel",
      "readStatus",
    ),
  };

  const [contactChannel, setContactChannel] = useState<
    ChannelContactList[] | null
  >(null);

  const [channelType, setChannelType] = useState<ChannelType[] | null>(null);

  const [showDialog, setShowDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });

  const methods = useForm<ContactChannelPayload>({
    resolver: zodResolver(contactChannelSchema),
    defaultValues: createDefaultContactChannelPayload(),
    mode: "onChange",
  });

  const [refreshChannel, setRefreshChannel] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [totalCount, setTotalRows] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshChannel((prev) => prev + 1);
  }, []);

  const [selectedContactChannel, setSelectedContactChannel] =
    useState<ChannelContactList | null>(null);

  const handleShowDialog = (
    show: boolean,
    mode: "create" | "update",
    selectedContactChannel: ChannelContactList | null,
  ) => {
    setShowDialog({ show, mode });
    setSelectedContactChannel(selectedContactChannel);
  };

  const doGetContactChannelList = async (
    page: number,
    size: number,
    sorting?: { id: string; desc: boolean }[],
    columnFilters?: { id: string; value: any }[],
  ) => {
    try {
      const sort = sorting?.[0];
      const filter = columnFilters?.[0];

      const response = await GetData(
        `${API_URL_REF}/api/channel-type/contact-channel`,
        {
          search: filter?.value || "",
          page: page + 1,
          size,
          sortBy: "CONTACT_CHANNEL_NAME",
          sortDirection: "desc",
          spId: 0,
        },
      );

      setContactChannel(response.data);
      setTotalRows(response.totalRows);

      return {
        data: response.data || [],
        totalCount: response.totalRows || 0,
      };
    } catch (error) {
      return {
        data: [],
        totalCount: 0,
      };
    }
  };

  const doGetChannelType = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/channel-type/list`,
        {},
      );

      setChannelType(response.data);

      return;
    } catch (error) {}
  };

  useEffect(() => {
    if (showDialog.show) {
      doGetChannelType();
    }
  }, [showDialog.show]);

  return (
    <ChannelContext.Provider
      value={{
        contactChannel,
        selectedContactChannel,
        setSelectedContactChannel,
        handleShowDialog,
        showDialog,
        handleRefresh,
        channelType,
        menuPrivAccess,
      }}
    >
      <DataGridProvider
        columns={ColumnChannel(handleShowDialog, menuPrivAccess)}
        key={`${refreshChannel}`}
        toolbar={<ListToolbar />}
        pagination={{ size: 10 }}
        layout={{ card: true }}
        sorting={[{ id: "CONTACT_CHANNEL_NAME", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          return doGetContactChannelList(
            pageIndex,
            pageSize,
            sorting,
            columnFilters,
          );
        }}
      >
        {children}
        <ChannelForm
          formType={showDialog.mode}
          forms={methods}
          isSubmitting={isSubmitting}
        />
      </DataGridProvider>
    </ChannelContext.Provider>
  );
};

export { ChannelContext, ChannelContextProvider };
