import ElevatorScene from './components/ElevatorScene'
import ElevatorExperience from './components/ElevatorExperience'

function App() {
  const params = new URLSearchParams(window.location.search)

  if (params.has('prototype')) {
    return <ElevatorScene />
  }

  return <ElevatorExperience showTools={params.has('tools') || params.has('tune')} />
}

export default App
