import { Container } from "@/components";
import { MainProductOfferAddContextProvider } from "./hooks";

export default function MainProductOfferAddPage() {
  return (
    <MainProductOfferAddContextProvider>
      <Container>
        <div className="grid gap-5 lg:gap-7.5"></div>
      </Container>
    </MainProductOfferAddContextProvider>
  );
}
