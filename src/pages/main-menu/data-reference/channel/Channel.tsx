import { Container, DataGridInner } from "@/components";
import { ChannelContextProvider } from "./hooks/ChannelContext";

export default function ChannelPage() {
  return (
    <ChannelContextProvider>
      <div className="border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm m-4">
        <h1 className="text-2xl font-bold text-gray-900">Channel</h1>
        <p className="text-sm text-gray-500 mt-1">Manage Channel</p>
      </div>
      <div className="grid gap-5 lg:gap-7.5 my-3 mx-5">
        <DataGridInner />
      </div>
    </ChannelContextProvider>
  );
}
