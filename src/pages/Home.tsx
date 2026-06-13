import makeInitData from '@/utils/makeInitData.ts'
import {useState, useEffect, useRef} from 'react'
import {ArrowLeft, EllipsisVertical, X, Sun, Laptop, Moon } from 'lucide-react'
import UrlPopup from '@/components/urlPopup'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CircularProgress from '@mui/material/CircularProgress'
import {usePopup} from "@/hooks/usePopup"
import storage from '@/utils/storage.ts';
import {useNavigate, useLocation} from 'react-router';
import {Star} from '@/assets/Icons'
import {FloatingMenu} from '@/components/FloatingMenu'
import { useTheme } from "@/hooks/useTheme"
import { eventHandler, getTheme } from '@/utils/eventHandler'

interface BackBtn {
    is_visible?: boolean;
}

interface MainBtn {
    is_visible?: boolean;
    is_active?: boolean;
    is_progress_visible?: boolean;
    text?: string;
    color?: string;
    text_color?: string;
    has_shine_effect?: boolean;
    event?: string;
}

interface SecBtn {
    is_visible?: boolean;
    is_active?: boolean;
    is_progress_visible?: boolean;
    text?: string;
    color?: string;
    text_color?: string;
    has_shine_effect?: boolean;
    position?: 'top' | 'left' | 'bottom' | 'right';
    event?: string;
}

interface StgBtn {
    is_visible?: boolean;
}
  
interface WebData {
    need_confirmation?: boolean;
}

interface AccelerometerOptions {
  frequency?: number;
}
declare class Accelerometer {
  constructor(options?: AccelerometerOptions);
  x: number;
  y: number;
  z: number;
  start(): void;
  stop(): void;
  addEventListener(event: 'reading', listener: () => void): void;
}

export default function Home() {
    const [webUrl, setWebUrl] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [url, setUrl] = useState<string>('');
    const [failed, setFailed] = useState<boolean>(false);
    const webapp = useRef<HTMLIFrameElement>(null)
    const [backBtn, setBackBtn] = useState<BackBtn>({})
    const [mainBtn, setMainBtn] = useState<MainBtn>({})
    const [stgBtn, setStgBtn] = useState<StgBtn>({})
    const [secBtn, setSecBtn] = useState<SecBtn>({})
    const [closed, setClosed] = useState<boolean>(false)
    const [theme, setTheme] = useState<Record<string, string>>({});
    const [hideHeader, setHideHeader] = useState<boolean>(localStorage.getItem('_tg_header_visible') === 'true' || false)
    const [reloadSupported, setReloadSupported] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('Miniapp')
    const {popup} = usePopup();
    const container = useRef(null);
    const [webData, setWebData] = useState<WebData>({});
    const sensorRef = useRef<Accelerometer | null>(null);
    const navigate = useNavigate();
    const location = useLocation()
    const { theme: appTheme, setTheme: setAppTheme } = useTheme()
    
    const setHeaderVisibility = (st: boolean) => {
        setHideHeader(st)
        localStorage.setItem('_tg_header_visible', String(st))
    }
    
    const postEvent = (eventType: string, eventData: any = '') => {
          if (!webapp.current) return;
          webapp.current?.contentWindow?.postMessage(JSON.stringify({
              eventType, eventData
          }), '*');
   }                
   
   const reload = () => {
        if (reloadSupported) postEvent('reload_iframe')
        else window.location.reload()
   }
  
   const setAm = (rr: any = 1000) => {
       try {
       if (rr === false) {
           sensorRef.current?.stop();
           sensorRef.current = null;
           return true;
       }
       if ('Accelerometer' in window) {
           if (!rr) return
           const sensor = new Accelerometer({frequency: 1000 / rr});
           sensor.addEventListener('reading', () => {
               postEvent('accelerometer_changed', {
                   x: sensor.x,
                   y: sensor.y,
                   z: sensor.z
               })
           });
           sensor.start();
           sensorRef.current = sensor;
           return true;
       } else {
           postEvent('accelerometer_failed', {error: 'UNSUPPORTED'});
       }
       } catch(err: any) {
           postEvent('accelerometer_failed', {error: 'UNSUPPORTED'});
       }
   }
    
    useEffect(() => {
            
        const invoiceDiv = (result: any) => {
            return <div>
                     <div className='flex items-center space-x-1'><span className='flex items-center'> Do you want to buy {result.title} for </span> <Star className='w-[1.3em]'/> <span className='flex items-center'>{result.stars}?</span> </div>
                     <b className='py-0.5'>{result.desc}</b>
                </div>
        }
        
        const context = { setBackBtn, setMainBtn, popup, postEvent, setTheme, setClosed, setWebData, invoiceDiv, setSecBtn, setStgBtn, setAm, setReloadSupported, theme, appTheme, setTitle }
        window.addEventListener('message', (ev) => eventHandler(ev, context))
    }, [])
    
    useEffect(() => {
        const handler = () => postEvent("theme_changed", { theme_params: getTheme(appTheme) })

        window.addEventListener("theme-changed", handler)

        return () => {
            window.removeEventListener("theme-changed", handler)
        }
    }, [appTheme])
    
    useEffect(() => {
        const storedUrl = storage.get('url');
        if (!url && !storedUrl) return setOpen(true)

        const u = url || storedUrl
        
        const { data, themeParams } = makeInitData(u + location.pathname + location.search)
        setTheme(themeParams)
        setWebUrl(prev => (prev !== data ? data : prev))
    }, [url])
    
    const btns = () => {
        const b = [mainBtn, secBtn];
        if (['left', 'top'].includes(secBtn.position || '')) return b.reverse();
        else return b;
    }
    
    const handleBack = () => {
        if (!backBtn.is_visible) {
        if (!webData.need_confirmation) setClosed(true);
        else popup({
                 message: 'Do you want to close miniapp?', title: 'Close App', 
                 buttons: [
                     {text: 'Cancel'},
                     {text: 'Close', type: 'destructive', onClick: () => setClosed(true)}
                 ]
             })
        }
        postEvent('back_button_pressed')
    }
    
    const changeTheme = () => {
        const tm = appTheme === 'light' ? 'dark' : appTheme === 'dark' ? 'system' : 'light'
        setAppTheme(tm)
    }
     
    return(<div className="w-screen h-[100dvh] flex flex-col" style={{
        background: theme.bg_color || 'var(--background)'
    }} ref={container}>
        
        <UrlPopup open={open} setOpen={setOpen} onSubmit={(vl: string) => {
            setUrl(vl);
            storage.setUrl(vl);
            storage.add(vl);
            setOpen(false);
        }}/>
        
        {hideHeader && <FloatingMenu reload={reload} onShow={() => setHeaderVisibility(false)} onSettings={() => postEvent('settings_button_pressed')} backText={backBtn.is_visible ? 'Back' : 'Close' } onBack={handleBack} changeTheme={changeTheme} appTheme={appTheme} hasSettings={stgBtn.is_visible} />}
        
        {!closed && !hideHeader && <header className="w-full p-2 flex border-b-1 border-border bg-background" style={{
            background: theme.header_bg_color || 'var(--background)'
        }}>
            <div className="flex gap-2 items-center flex-1">
            <button onClick={handleBack} className="ripple px-1.5 rounded-full">{backBtn.is_visible ? <ArrowLeft /> : <X />}</button>
            <div className='w-full flex'>
            <span className="font-bold">{title || 'Miniapp'}</span>
            </div>
            </div>
            <button className="rounded-full hover:bg-transparent mx-2" onClick={changeTheme}>            
                {appTheme === 'light' ? <Sun className='w-5 h-5' /> : appTheme === 'dark' ? <Moon className='w-5 h-5' /> : <Laptop className='w-5 h-5' />}
            </button>
            {<DropdownMenu modal={false}>
        <DropdownMenuTrigger className='bg-transparent active:bg-transparent' asChild>
          <Button aria-label="Open menu" size="icon" className="rounded-full hover:bg-transparent text-foreground">            
            <EllipsisVertical className='w-5 h-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => reload()} className="ripple focus:transparent">
              <span>Reload</span>
            </DropdownMenuItem>
            
            {stgBtn.is_visible && <DropdownMenuItem className="ripple focus:transparent" onSelect={() => postEvent('settings_button_pressed')}>
              <span>Settings</span>
            </DropdownMenuItem>}
            
            <DropdownMenuItem onSelect={() => navigate('/settings')} className="ripple focus:transparent">
             <span>Users & Bots</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => navigate('/webs')} className="ripple focus:transparent">
             <span>Miniapps</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => navigate('/docs')} className="ripple focus:transparent">
             <span>Docs</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => window.location.href = 'https://t.me/mhminiapp'} className="ripple focus:transparent">
             <span>Channel</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => setHeaderVisibility(true)} className="ripple focus:transparent">
             <span>Hide Header</span>
            </DropdownMenuItem>
            
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>}
        </header>}
        
        
        {webUrl &&
        <iframe
           src={webUrl}
           className="w-full flex-1 border-none" onError={() => setFailed(true)} 
           ref={webapp}
           allow="clipboard-read; clipboard-write; camera"
        />}
        {!webUrl && !failed && <div className="flex w-full h-[90%] justify-center items-center flex-col gap-2 overflow-hidden">
            <h3 className="text-2xl">Loading</h3>
        </div>}
        
        {closed && <div className="flex w-screen h-screen fixed top-0 left-0 z-4 justify-center items-center flex-col gap-2 overflow-hidden bg-background">
            <h3 className="text-2xl">Closed</h3>
            <p className="text-muted">Miniapp closed</p>
            <button className="py-2 px-10 bg-primary text-primary-foreground rounded-xl ripple" onClick={() => { reload(); setClosed(false) }}>Open</button>
        </div>}
        
        {!webUrl && <div className="flex w-screen h-screen fixed top-0 left-0 z-4 justify-center items-center flex-col gap-2 overflow-hidden bg-background">
            <h3 className="text-2xl">No Website Added Yet</h3>
            <p className="text-muted">Add a website URL to get started</p>
            <button className="py-2 px-10 bg-primary text-primary-foreground rounded-xl ripple" onClick={() => setOpen(true)}>Add URL</button>
        </div>}
        
        {(mainBtn.is_visible || secBtn.is_visible) && <div className={`w-full bg-background py-2 px-3 flex justify-center gap-2 ${['top', 'bottom'].includes(secBtn.position || '') ? 'flex-col' : ''}`}>
            
            {!closed && btns().map((btn, ind) => {
                if (!btn?.is_visible) return;
                
                return(<button className={`w-full py-2.5 bg-primary text-primary-foreground rounded-lg active:scale-96 data-[inactive=true]:active:scale-100 transition-transform duration-200 flex items-center justify-center ripple ${btn.has_shine_effect ? 'shine-effect' : ''}`} data-inactive={!btn.is_active} data-rp-color={btn.text_color + '50'} style={{background: btn.color || 'var(--primary)', color: btn.text_color || 'var(--primary-foreground)'}} onClick={() => {
                if (!btn.is_active) return;
                postEvent(btn.event || "")
            }} key={ind}>
                {btn.is_progress_visible ? <CircularProgress size={'1.5em'} color="inherit"/> : <span>{btn.text || "Continue"}</span>}
            </button>)
            })}
            
        </div>}
    </div>)
}
