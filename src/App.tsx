import { AppShell } from './components/AppShell'
import { GameScreen } from './components/GameScreen'

function App() {
  const params = new URLSearchParams(window.location.search)
  const seedParam = params.get('seed')
  const parsed = seedParam ? Number.parseInt(seedParam, 10) : undefined
  const initialSeed = Number.isFinite(parsed) ? parsed : undefined

  return (
    <AppShell>
      <GameScreen initialSeed={initialSeed} />
    </AppShell>
  )
}

export default App
