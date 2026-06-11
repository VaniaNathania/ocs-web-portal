import { Container, DataGridInner } from '@/components';
import { EditDialog } from './blocks';
import { GoodsContextProvider } from './hooks';
import { AddDialog } from './blocks/AddDialog';
import { DeleteDialog } from './blocks/DeleteDialog';

export default function GoodsPage() {
  return (
    <GoodsContextProvider>
      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
        <EditDialog />
        <AddDialog />
        <DeleteDialog />
      </Container>
    </GoodsContextProvider>
  );
}
