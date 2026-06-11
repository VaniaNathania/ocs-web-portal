import { Container, DataGridInner, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { WorkFlowRuleContextProvider } from "./hook/WorkFlowRuleModuleContext";
import WorkFlowPage from "./block/WorkFlowRulePage";

const WorkFlowRule = () => {
  const navigate = useNavigate();
  return (
    <WorkFlowRuleContextProvider>
      <Container className="pt-5">
        <div className="mb-5 flex items-center gap-4 border-l-4 border-red-500 bg-white px-6 py-4 shadow-sm">
          <Button
            onClick={() => navigate(-1)}
            title="Go back"
            className="flex h-9 w-12 items-center justify-center rounded-md bg-red-500 shadow-md transition-all duration-200 hover:bg-red-600"
          >
            <KeenIcon icon="arrow-left" className="text-lg text-white" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              WorkFlow Rule & Recurring Event
            </h1>
            <p className="mt-1 text-sm text-gray-500">Business Common</p>
          </div>
        </div>
        <div>
          <WorkFlowPage/>
        </div>
      </Container>
    </WorkFlowRuleContextProvider>
  );
};

export default WorkFlowRule;
