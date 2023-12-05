import React from 'react'
import Home from './Home'
import Form from './Form'
import{ Link, Route, Routes,} from 'react-router-dom'

function App() {
  return (
    <div id="app">
      
      <nav>
        <Link to='/'>Home</Link>
        <Link to='/order'>Order</Link>
      </nav>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/order" element={<order />} />

      </Routes>
      
      {/* Route and Routes here */}
      <Home />
      <Form />
    </div>
    
  )
}

export default App
