
import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Profile from './pages/profile'
import Signup from './pages/signup'
import Signin from './pages/signin'
import Dashboard from './pages/dashboard'
import Landing from './pages/landing'
import Calendar from './pages/calendar'
import BoardView from './pages/board/[boardId]'
import TemplatePreview from './pages/templatePreview'
import ProtectedRoute from './components/protectedRoute'


function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path='/calendar' element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/template-preview/:templateId" element={
          <ProtectedRoute>
            <TemplatePreview />
          </ProtectedRoute>
        } />
        <Route path="/board/:boardId" element={
          <ProtectedRoute>
            <BoardView />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter >
  )
}

export default App
