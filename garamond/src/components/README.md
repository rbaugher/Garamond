# Game components README

This short README documents the shared GamePage wrapper and the consolidated `GameNavbar` API.

Purpose
- `GamePageWrapper` mounts `GameModeProvider` and `DifficultyProvider` so game pages and their control panels can safely call `useGameMode()` and `useDifficulty()`.
- `GameNavbar` is a configurable navbar that renders small control components (gamemode, difficulty, mechanics/how-to-play, settings, stats). Pages opt into the controls they need.

Usage
- Wrap your game page with `GamePageWrapper` so controls and panels can use the shared contexts:

```jsx
import GamePageWrapper from '../GamePageWrapper';

export default function MyGamePage() {
  return (
    <GamePageWrapper>
      <div className="game-page-wrapper">
        <GameNavbar
          title="My Game"
          controls={[ 'gamemode', 'difficulty', 'settings', 'stats' ]}
          activeControl={activeControl}
          onControlChange={setActiveControl}
        />
        <MyGameApp />
      </div>
    </GamePageWrapper>
  );
}
```

GameNavbar API (summary)
- props:
  - `title?: string` — page title shown in the navbar
  - `controls?: string[]` — list of control ids to render (defaults to `['gamemode','difficulty','mechanics','stats']`)
  - `controlProps?: Record<string, any>` — props forwarded to specific control components
  - `controlComponents?: Record<string, ReactComponent>` — override default control components
  - `activeControl?: string|null` — id of the currently-open control panel
  - `onControlChange?: (id:string|null) => void` — callback when a control button is toggled
  - `onControlClose?: () => void` — optional close handler
  - `user?: object` — override for the navbar user/profile menu

Notes
- Control ids: `gamemode`, `difficulty`, `mechanics`, `settings`, `stats`.
- `mechanics` is intended for "how to play" / explanation panels; `settings` is intended for game configuration panels.
- If you need per-game customization, pass `controlProps` or `controlComponents`.
