import Home from '@/pages/Home'
import {BrowserRouter, Routes, Route} from 'react-router'
import {PopupProvider} from '@/hooks/usePopup'
import {useRipple} from '@/hooks/useRipple'
import {Webs} from '@/pages/Webs'
import {Settings} from '@/pages/Settings'
import {Doc} from '@/pages/Doc'
import { ThemeProvider } from "@/hooks/useTheme"

function App() {
  useRipple()
  return (
    <div>
       <ThemeProvider>
       <PopupProvider>
       <BrowserRouter>
           <Routes>
               <Route path="/" element={<Home />} />
               <Route path="/settings" element={<Settings />} />
               <Route path='/webs' element={<Webs />} />
               <Route path='/docs' element={<Doc />} />
               <Route path="/*" element={<Home />} />
           </Routes>
       </BrowserRouter>
       </PopupProvider>
       </ThemeProvider>
    </div>
  )
}

export default App
