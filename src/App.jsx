import ElevatorExperience from './components/ElevatorExperience'

function App() {
  const params = new URLSearchParams(window.location.search)

  return <ElevatorExperience showTools={params.has('tools') || params.has('tune')} />
}

export default App
