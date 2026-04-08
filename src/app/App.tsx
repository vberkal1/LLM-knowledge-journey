import { GameProvider } from 'app/providers/game';
import { JourneyProvider } from 'app/providers/journey';
import { AppRouter } from 'app/providers/router';
import { AppShell } from 'shared/ui/AppShell/AppShell';

export function App(): JSX.Element {
  return (
    <GameProvider>
      <JourneyProvider>
        <AppShell>
          <AppRouter />
        </AppShell>
      </JourneyProvider>
    </GameProvider>
  );
}
