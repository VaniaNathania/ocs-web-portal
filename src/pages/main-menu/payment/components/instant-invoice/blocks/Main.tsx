import { Button } from "@/components/ui/button";
import { useState } from "react";
import MakeBillData from "./MakeBillData";
import PrintBillData from "./PrintBillData";

const Main = () => {
  const tabs = [
    { id: "makeBillData", label: "Make Bill Data" },
    { id: "printBill", label: "Print Bill" },
  ];
  const [activeTab, setActiveTab] = useState("makeBillData");
  return (
    <div className="">
      <div className="flex border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={"ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="">
        {activeTab === "makeBillData" && <MakeBillData />}
        {activeTab === "printBill" && <PrintBillData />}
      </div>
    </div>
  );
};

export default Main;
