import ElevatorExperience from './components/ElevatorExperience'

function App() {
  const params = new URLSearchParams(window.location.search)
  // /#projects is the return target from pages like /cua: it skips the ride
  // and opens the portfolio on the projects floor. A plain / is unchanged.
  const startFloor = window.location.hash === '#projects' ? 'projects' : null

  return <ElevatorExperience showTools={params.has('tools') || params.has('tune')} startFloor={startFloor} />
}

export default App
