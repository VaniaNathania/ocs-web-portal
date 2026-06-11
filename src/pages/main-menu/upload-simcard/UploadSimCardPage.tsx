import { Container } from "@/components";
import { UploadSimCardContextProvider } from "./hooks/UploadSimCardContext";
import UploadSimCard from "./blocks/UploadSimCard";

export default function UploadSimCardPage() {
  return (
    <UploadSimCardContextProvider>
      <Container className="px-1 mt-1 h-full">
        <div className="h-fit">
          <UploadSimCard />
        </div>
      </Container>
    </UploadSimCardContextProvider>
  );
}
