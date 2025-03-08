import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signin from './components/Signin'
import Signup from './components/Signup'
import Home from './components/Home'
import DocumentTextExtractor from './pages/DocumentTextExtractor'
import AcceptanceRejection from './components/AcceptanceRejection'
import HomePage from './components/HomePage'



function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />

          <Route path='/extract-text' element={<DocumentTextExtractor/>}/>

          <Route path='/homepage' element={<HomePage/>} />
          <Route path="/acceptance-rejection" element={<AcceptanceRejection />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
