import ListToolbar from "./blocks/ListToolbar";
import SimcardDetail from "./blocks/SimcardDetail";
import SimcardProfileTable from "./blocks/SimcardProfileTable";
import { SimcardProfileContextProvider } from "./hooks/SimcardProfileContext";

export default function ChangeNumberProfilePage() {
  return (
    <SimcardProfileContextProvider>
      <div className="flex flex-col min-h-screen">
        <ListToolbar />
        <SimcardProfileTable /> 
        <SimcardDetail/>
      </div>
    </SimcardProfileContextProvider>
  );
}
