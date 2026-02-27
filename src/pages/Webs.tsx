import { SquareArrowOutUpRight, Trash2 } from 'lucide-react'
import {useEffect, useState} from 'react'
import {usePopup} from "@/hooks/usePopup"
import {useNavigate} from 'react-router'

function isUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

interface WebProps {
    url: string
}

export const Webs = () => {

    const [webs, setWebs] = useState<WebProps[]>([])
    const {popup} = usePopup()
    const nav = useNavigate()
    
    useEffect(() => {
        const list = JSON.parse(localStorage.getItem('_tg_webs') || '[]')
        console.log(list)
        setWebs(list)
    }, [])
    
    const deleteWeb = (url: string) => {
        popup({
            title: 'Delete Web',
            message: 'Are you sure you want to delete the website and all data stored on it?',
            buttons: [
                { text: 'Cancel', type: 'cancel' },
                {
                    text: 'Delete',
                    type: 'destructive',
                    onClick: () => {
                        setWebs(p => {
                            const list = p.filter(w => w.url !== url)
                            localStorage.setItem('_tg_webs', JSON.stringify(list || []))
                            return list
                        })                        
                    }
                }
            ]
        })
    }
    
    const addWeb = () => {
        popup({
            title: 'Add Web',
            message: 'Enter url of the web to add',
            inputs: [{
                placeholder: 'http://localhost:5173'
            }],
            buttons: [
                { text: 'Cancel', type: 'cancel' },
                {
                    text: 'Add Web',
                    close: false,
                    onClick: ({ input, setErrorMsg, close: closePop }) => {
                        const vl = input.value?.trim?.()
                        if (!isUrl(vl)) return setErrorMsg('Invalid URL, try again.')
                        if (webs.find(w => w.url === vl)) return setErrorMsg('This website URL has already been added by you.')
                        setWebs(prev => {
                            const updated = [...prev, { url: vl }]
                            localStorage.setItem('_tg_webs', JSON.stringify(updated))
                            return updated
                        })
                        closePop()
                    }
                }
            ]
        })
    }
    
    const openWeb = (url: string) => {
        localStorage.setItem('_tg_current', url)
        nav('/')
    }
    
  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      <header className="bg-[#181818] py-3 text-center border-b border-gray-800 relative">
        <h3 className="text-xl font-semibold tracking-wide">Web Apps</h3>
        <button className='absolute right-2 top-2.5 bg-blue-500 px-4 py-1 rounded-full min-w-20' onClick={addWeb}>Add</button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {webs.length > 0 ? <div className="grid grid-cols-2 gap-4">
          {webs.map((web, ind) => (
            <div
              key={ind}
              className="bg-[#181818] rounded-xl p-4 flex flex-col gap-3 border border-gray-800 hover:border-gray-600 transition-colors duration-200"
            >
              
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-lg">Web {ind + 1}</h4>
                <span className="text-gray-400 text-sm break-all">{web.url}</span>
              </div>

              
              <div className="flex flex-col gap-2 mt-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#ff2a35] hover:bg-[#ff4b50] rounded-lg transition-colors duration-200" onClick={() => deleteWeb(web.url)}>
                  <Trash2 className="h-5 w-5" />
                  <span>Delete</span>
                </button>

                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#007bff] hover:bg-[#339cff] rounded-lg transition-colors duration-200" onClick={() => openWeb(web.url)}>
                  <SquareArrowOutUpRight className="h-5 w-5" />
                  <span>Open</span>
                </button>
              </div>
            </div>
          ))}
        </div> : <div className='w-full flex flex-col space-y-2 items-center min-h-30 justify-center'>
            <h3 className='font-semibold text-lg text-white'>No Websites</h3>
            <p className='text-sm text-[#ccc]'>No websites have been added. Please add a website.</p>
        </div>}
      </main>
    </div>
  )
}