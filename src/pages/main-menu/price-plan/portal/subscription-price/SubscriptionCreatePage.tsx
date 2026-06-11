import {
  SubscriptionPriceCreateContextProvider,
  useSubscriptionPriceCreateContext,
} from "./hooks";
import CreateEventDialog from "./blocks/CreateEventDialog";
import { AccumulationContextProvider } from "./blocks/accumulation/hooks/AccumulationContext";
import AddPriceDialog from "./blocks/accumulation/blocks/AddPriceDialog";

export default function SubscriptionCreatePage() {
  const { createDialogPosition } = useSubscriptionPriceCreateContext();
  return (
    <SubscriptionPriceCreateContextProvider>
      <CreateEventDialog position={createDialogPosition ?? undefined} />
    </SubscriptionPriceCreateContextProvider>
  );
}
