import { Container } from "@/components";
import { RatableEventActionContextProvider } from "./hooks/RatableEventActionContext";
import RatableEventActionContent from "./components/RatableEventActionContent";
import RatableEventActionMaster from "./components/RatableEventActionMaster";
import RatableEventActionMasterDetail from "./components/RatableEventActionMasterDetail";
import RatableEventActionContentDetail from "./components/RatableEventActionContentDetail";

export default function RatableEventActionPage() {
  return (
    <RatableEventActionContextProvider>
      <Container className="px-1 mt-1 h-full">
        <div className="flex flex-row h-full">
          <div className="w-[30%] h-full flex flex-col mr-3 gap-2">
            <div className="h-[70%] border-[1px] shadow-md">
              <RatableEventActionMaster />
            </div>
            <div className="flex-1 border-[1px] shadow-md">
              <RatableEventActionMasterDetail />
            </div>
          </div>
          <div className="flex-1 h-full flex flex-col gap-2">
            <div className="h-[70%] border-[1px] shadow-md">
              <RatableEventActionContent />
            </div>
            <div className="flex-1 border-[1px] shadow-md">
              <RatableEventActionContentDetail />
            </div>
          </div>
        </div>
      </Container>
    </RatableEventActionContextProvider>
  );
}
