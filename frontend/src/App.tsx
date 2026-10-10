import { useState } from 'react'
import './App.css'
import ServiceSelectionPage from './components/pages/ServiceSelectionPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="App">
        <ServiceSelectionPage />
      </div>
      <section id="spacer"></section>
    </>
  )
}

export default App