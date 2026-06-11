import { Container } from "@/components";
import { ZoneMainContextListProvider } from "./hooks/ZoneContext";
import ZoneDetail from "./component/ZoneDetail";

export default function ZonePageMain() {
  return (
    <ZoneMainContextListProvider>
      <Container className="p-0">
      </Container>
    </ZoneMainContextListProvider>
  );
}
