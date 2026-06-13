import { themeParams, type IThemeParams } from '@/utils/themeParams'
import {enterFullscreen, exitFullscreen} from '@/utils/fullscreen'
import storage from '@/utils/storage.ts'
import fetchInvoice from '@/utils/openInvoice'
import {initBiometrics, authenticate} from '@/utils/initBiometrics'
import {encode, decode} from 'mh-encoder'

export const getTheme = (theme?: 'system' | 'dark' | 'light') => {
    const isDark =
    theme === 'dark'
      ? true
      : theme === 'light'
      ? false
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const white = !isDark
    
    const bg = white ? '#ffffff' : '#000000'
    const tc = white ? '#000000' : '#ffffff'
  
    return {
        bg_color: bg,
        button_color: "#3B82F6",
        button_text_color: "#ffffff",
        hint_color: "#ffffff",
        link_color: "#3B82F6",
        secondary_bg_color: bg,
        text_color: tc,
        header_bg_color: bg,
        accent_text_color: '#ffffff',
        section_bg_color: "#212121",
        section_header_text_color: "#3B82F6",
        subtitle_text_color: "#aaaaaa",
        destructive_text_color: "#ff595a",    
        bottom_bar_bg_color: bg
    }
}

export const eventHandler = async(event: any, context: any) => {
    const data = JSON.parse(event.data)
    const {eventType, eventData} = data
    console.log("New Event:", eventType, eventData)
    
    const { setBackBtn, setMainBtn, setSecBtn, setTheme, popup, postEvent, setClosed, setWebData, invoiceDiv, setStgBtn, setAm, setReloadSupported, setTitle, theme, appTheme } = context
    
    switch (eventType) {
        case 'web_app_setup_back_button':
            setBackBtn(eventData)            
        break
        
        case 'web_app_setup_main_button':
            setMainBtn({...eventData, event: 'main_button_pressed'})
        break
        
        case 'web_app_setup_secondary_button':
            setSecBtn({...eventData, event: 'secondary_button_pressed'})
        break
        
        case 'web_app_set_header_color': {
            const colorKey = eventData.color_key as string
            const color = eventData.color || theme[colorKey]
            setTheme((p: any) => ({...p, header_bg_color: color }))
            break
        }
        
        case 'web_app_set_background_color': {
            const colorKey = eventData.color_key as keyof IThemeParams
            const color = eventData.color || themeParams[colorKey] || '#181819'
            setTheme((p: any) => ({...p, bg_color: color }))
            break
        }
        
        case 'web_app_set_bottom_bar_color': {
            const colorKey = eventData.color_key as keyof IThemeParams
            const color = eventData.color || themeParams[colorKey] || '#181819'
            setTheme((p: any) => ({...p, bottom_bar_color: color}))
            document.documentElement.style.backgroundColor = color
            break
        }
        
        case 'web_app_open_popup': {
            const _btns = (eventData.buttons as Array<{ id: string; onClick?: () => void }>).map((b) => {
                 b.onClick = () => {
                     postEvent('popup_closed', {button_id: b.id})
                 }
                 return b
            })
            popup({...eventData, buttons: _btns.reverse(), onClose: () => postEvent('popup_closed')})
            break
        }
        
        case 'web_app_request_fullscreen': {
            try {
               await enterFullscreen();
            } catch(err: any) {
                popup({
                    message: 'User interaction required', title: 'Fullscreen request', 
                    buttons: [
                        {text: 'Ok', onClick: () => enterFullscreen()},
                    ],
                    onClose: () => enterFullscreen()
                })
            }
            break
        }
        
        case 'web_app_exit_fullscreen':
            await exitFullscreen().catch(() => {})
        break
        
        case 'web_app_expand':
            setClosed(false)
        break
        
        case 'web_app_close':
            setClosed(true)
        break
        
        case 'web_app_setup_closing_behavior':
            setWebData((p: any) => ({...p, need_confirmation: eventData.need_confirmation }))
        break
        
        case 'web_app_open_link': {
            const allowed = storage.get('open_links')
            if (allowed) return window.open(eventData.url, '_blank')
            popup({
                title: 'Open Link',
                message: 'Do you want to open this link?',
                checkboxes: [{
                    label: 'Always automatically open'
                }],
                buttons: [
                    { type: 'cancel' },
                    {
                        text: 'Open',
                        onClick: ({ checkboxes }: { checkboxes: any }) => {
                            const chk = checkboxes[0] || false
                            storage.set('open_links', chk)
                            window.open(eventData.url, '_blank')
                        }
                    }
                ]
            })
            break
        }
        
        case 'web_app_open_tg_link': {
            const allowed = storage.get('open_links')
            if (allowed) return window.location.href = `https://t.me${eventData.path_full}`
            popup({
                title: 'Open Telegram Link',
                message: 'Do you want to open this link?',
                checkboxes: [{
                    label: 'Always automatically open'
                }],
                buttons: [
                    { type: 'cancel' },
                    {
                        text: 'Open',
                        onClick: ({ checkboxes }: { checkboxes: any }) => {
                            const chk = checkboxes[0] || false
                            storage.set('open_links', chk)
                            window.location.href = `https://t.me${eventData.path_full}`
                        }
                    }
                ]
            })
            break
        }
        
       case 'web_app_open_invoice': {
            const slug = eventData.slug    
            const result = await fetchInvoice(slug)
            if (result.error) return postEvent('invoice_closed', { status: 'failed', slug })
            popup({
                title: 'Invoice',
                message: invoiceDiv(result),
                onClose: () => postEvent('invoice_closed', { status: 'cancelled', slug }),
                buttons: [
                    { text: 'Cancel', type: 'cancel' },
                    {
                        text: 'Open Invoice',
                        onClick: () => {window.location.href = `https://t.me/$${eventData.slug}`; postEvent('invoice_closed', { status: 'pending', slug })}
                    }
               ]
           })
           break
        }
        
        case 'web_app_biometry_get_info': {
            const bd = await initBiometrics();
            postEvent('biometry_info_received', bd)
            break
        }
        
        case 'web_app_biometry_request_access': {
            if (storage.get('bm_allowed')) {
                const bd = await initBiometrics();
                return postEvent('biometry_info_received', bd)
            }
                 
            async function rqa() {
                 if (await authenticate()) {
                     storage.set('bm_allowed', true);
                     const bd = await initBiometrics();
                     bd.access_granted = true;
                     postEvent('biometry_info_received', bd)
                 }
            }
                 
                 popup({message: `Do you want to allow device biometrics?\n${eventData.reason || ''}`, title: 'Biometric Request', buttons: [
                     {text: 'Cancel'},
                     {text: 'Allow', onClick: rqa},
                 ]});
            break
        }
        
        case 'web_app_biometry_request_auth': {
            const isAuth = await authenticate(eventData.reason)
            if (isAuth) {
                 const btk = storage.get('bm_token');
                 postEvent('biometry_auth_requested', {
                     status: 'authorized',
                     token: btk ? decode(btk) : undefined
                 })
             } else {
                 postEvent('biometry_auth_requested', {
                     status: 'failed'
                 })                     
             }
             break
        }
        
        case 'web_app_biometry_update_token':
            storage.set('bm_token', encode(eventData.token))
            postEvent('biometry_token_updated', {status: 'updated'})
        break
        
        case 'web_app_setup_settings_button':
            setStgBtn(eventData)
        break        
        
        case 'web_app_start_accelerometer':
            postEvent('accelerometer_started')            
            setAm(eventData.refresh_rate)
        break
        
        case 'web_app_stop_accelerometer':
            setAm(false)
        break
        
        case 'web_app_invoke_custom_method': {
            if (eventData.method === 'saveStorageValue') {
                try {
                     const cs = storage.get('cloud_storage') || {};
                     cs[eventData.params.key] = eventData.params.value;
                     storage.set('cloud_storage', cs);
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: true});
                 } catch(err: any) {
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: false, error: 'Couldn’t save to cloud storage'})
                 }
                 } else if (eventData.method === 'getStorageValues') {
                 try {
                     const cs = storage.get('cloud_storage') || {};
                     const result: any = {};
                     (eventData.params.keys as string[]).forEach((v: string) => {
                         result[v] = cs[v] ?? undefined;
                     });
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result});
                 } catch(err: any) {
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: false, error: err.message})
                 }
                 } else if (eventData.method === 'deleteStorageValues') {
                 try {
                     const cs = storage.get('cloud_storage') || {};
                     (eventData.params.keys as string[]).forEach((v: string) => {
                         delete cs[v];
                     });
                     storage.set('cloud_storage', cs);
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: true});
                 } catch(err: any) {
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: false, error: err.message})
                 }
                 } else if (eventData.method === 'getStorageKeys') {
                 try {
                     const cs = storage.get('cloud_storage') || {};
                     const result = Object.keys(cs);
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result});
                 } catch(err: any) {
                     postEvent('custom_method_invoked', {req_id: eventData.req_id, result: false, error: err.message})
                 }
                }
            break
        }
        
        case 'web_app_start_gyroscope':
            postEvent('gyroscope_failed', {error: 'UNSUPPORTED'})
        break
        
        case 'web_app_start_device_orientation':
            postEvent('device_orientation_failed', {error: 'UNSUPPORTED'})
        break
        
        case 'web_app_check_location': {
            const available = 'geolocation' in navigator
            const granted = storage.get('lc_allowed') || false
            postEvent('location_checked', {available, access_requested: granted, access_granted: granted})
            break
        }
        
        case 'web_app_request_location': {
            try {
                const getLocation = () => {
                navigator.geolocation.getCurrentPosition(pos => {
                postEvent('location_requested', pos.coords)
                },
                err => {
                     console.log(err.message)
                }
                )
                }
                if (!storage.get('lc_allowed')) {
                     popup({
                         message: "Do you want to allow your geolocation?",
                         title: "Location request",
                         buttons: [
                             {
                                 text: 'Cancel'
                             },
                             {text: 'Allow', onClick: () => {
                                 storage.set('lc_allowed', true);
                                 getLocation();
                             }},
                         ]
                     })
                 } else {
                     getLocation()
                 }
                 } catch(err: any) {
                    console.log(err) 
                 }
            break
        }
        
        case 'web_app_device_storage_save_key': {
            try {
                const ds = storage.get('device_storage') || {};
                ds[eventData.key] = eventData.value;
                storage.set('device_storage', ds);                 
                postEvent('device_storage_key_saved', {req_id: eventData.req_id});
            } catch(err: any) {
                postEvent('device_storage_failed', {req_id: eventData.req_id, error: err.message});
            }
            break
        }
        
        case 'web_app_device_storage_get_key': {
            try {
                const ds = storage.get('device_storage') || {};
                const value = ds[eventData.key];
                postEvent('device_storage_key_received', {req_id: eventData.req_id, value});
            } catch(err: any) {
                postEvent('device_storage_failed', {req_id: eventData.req_id, error: err.message});
            }
            break
        }
        
        case 'web_app_device_storage_clear': {
            try {
                storage.set('device_storage', {});
                postEvent('device_storage_cleared', {req_id: eventData.req_id});
            } catch(err: any) {
                postEvent('device_storage_failed', {req_id: eventData.req_id, error: err.message});
            }
            break
        }
        
        case 'web_app_secure_storage_save_key': {
            try {
                const ss = storage.get('secure_storage') || {};
                ss[eventData.key] = eventData.value;
                storage.set('secure_storage', ss);
                postEvent('secure_storage_key_saved', {req_id: eventData.req_id});
            } catch(err: any) {
                postEvent('secure_storage_failed', {req_id: eventData.req_id, error: err.message});
           }
           break
        }
        
        case 'web_app_secure_storage_get_key': {
            try {
                const ss = storage.get('secure_storage') || {};
                const value = ss[eventData.key];
                postEvent('secure_storage_key_received', {req_id: eventData.req_id, value});
             } catch(err: any) {
                postEvent('secure_storage_failed', {req_id: eventData.req_id, error: err.message});
             }
             break
        }
        
        case 'web_app_secure_storage_clear': {
            try {
                storage.set('secure_storage', {});
                postEvent('secure_storage_cleared', {req_id: eventData.req_id});
            } catch(err: any) {
                postEvent('secure_storage_failed', {req_id: eventData.req_id, error: err.message});
            }
            break
        }
        
        case 'iframe_ready':
            setReloadSupported(eventData.reload_supported)
        break
        
        case 'app_title':
            setTitle(eventData.title)
        break
        case 'web_app_request_theme':
            postEvent('theme_changed', { theme_params: getTheme(appTheme) })
        break
    }
}
