import { AppRouter } from 'app/providers/router';
import { AppShell } from 'shared/ui/AppShell/AppShell';

export function App(): JSX.Element {
  return (
    <AppShell>
      <AppRouter />
    </AppShell>
  );
}
