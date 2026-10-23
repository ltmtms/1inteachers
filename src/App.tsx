import { GameScreen } from './components/GameScreen'

function App() {
  const params = new URLSearchParams(window.location.search)
  const seedParam = params.get('seed')
  const parsed = seedParam ? Number.parseInt(seedParam, 10) : undefined
  const initialSeed = Number.isFinite(parsed) ? parsed : undefined

  return <GameScreen initialSeed={initialSeed} />
}

export default App
