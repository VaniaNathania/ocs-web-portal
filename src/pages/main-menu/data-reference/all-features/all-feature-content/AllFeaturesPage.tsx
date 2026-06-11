import { Container } from "@/components";

import AllFeatureTabContent from "./AllFeatureTabContent";
import { AllFeatureProvider } from "./hooks/context";

export default function AllFeaturesPage() {
  return (
    <AllFeatureProvider>
      <Container className="px-1 mt-1 flex-1 min-h-0 overflow-hidden">
        <AllFeatureTabContent rowData={null} />
      </Container>
    </AllFeatureProvider>
  );
}
