import { Container, DataGridInner } from '@/components';
import { LogActivityContextProvider } from './hooks';

export default function LogActivityPage() {
  return (
    <LogActivityContextProvider>
      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
      </Container>
    </LogActivityContextProvider>
  );
}
