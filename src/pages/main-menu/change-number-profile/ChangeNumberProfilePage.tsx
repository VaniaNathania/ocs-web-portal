
import ListToolbar from "./blocks/ListToolbar";
import ChangeNumberProfileTable from "./components/ChangeNumberProfileTable";
import { ChangeNumberProfileContextListProvider } from "./hooks/ChangeNumberProfileContext";

export default function ChangeNumberProfilePage() {
  return (
    <ChangeNumberProfileContextListProvider>
      <div className="flex flex-col min-h-screen">
        <ListToolbar />
        <ChangeNumberProfileTable />
      </div>
    </ChangeNumberProfileContextListProvider>
  );
}