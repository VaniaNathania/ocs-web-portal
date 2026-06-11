import { Container, DataGridInner, KeenIcon } from "@/components";
import DialogForm from "./blocks/DialogForm";
import AccmTypeModule from "./hooks/AccmTypeModule";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const AccmType = () => {
  const navigate = useNavigate();
  return (
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
            Accumulation Type
          </h1>
          <p className="mt-1 text-sm text-gray-500">Business Common</p>
        </div>
      </div>

      <AccmTypeModule>
        <DataGridInner />
      </AccmTypeModule>
    </Container>
  );
};

export default AccmType;
