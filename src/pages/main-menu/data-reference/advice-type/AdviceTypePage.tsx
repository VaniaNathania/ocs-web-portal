import { Container } from "@/components";
import { AdviceTypeContextListProvider } from "./hooks/AdviceTypeContext";

export default function AdviceTypeMain() {
  return (
    <AdviceTypeContextListProvider>
      <Container className="p-0"></Container>
    </AdviceTypeContextListProvider>
  );
}
