import { Container } from "@/components";
import { TimeSpanContextProvider } from "./hooks/SpanTimeContext";
import TimeSpanDetailContent from "./components/TimeSpanDetailContent";
import TimeSpanSidebar from "./components/TimeSpanSidebar";
import TimeSpanSidebarDetail from "./components/TimeSpanSidebarDetail";
import TimeSpanContent from "./components/TimeSpanContent";

export default function TimeSpanPage() {
  return (
    <TimeSpanContextProvider>
      <Container className="px-1 mt-1 h-full">
        <div className="flex flex-row h-full">
          <div className="w-[30%] h-full flex flex-col mr-3 gap-2">
            <div className="h-[70%] border-[1px] shadow-md">
              <TimeSpanSidebar />
            </div>
            <div className="flex-1 border-[1px] shadow-md">
              <TimeSpanSidebarDetail />
            </div>
          </div>
          <div className="flex-1 h-full flex flex-col gap-2">
            <div className="h-[70%] border-[1px] shadow-md">
              <TimeSpanContent />
            </div>
            <div className="flex-1 border-[1px] shadow-md">
              <TimeSpanDetailContent />
            </div>
          </div>
        </div>
      </Container>
    </TimeSpanContextProvider>
  );
}
