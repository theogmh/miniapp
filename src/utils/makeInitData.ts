import CryptoJS from 'crypto-js'

export interface User {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code: string;
    allows_write_to_pm: boolean;
    photo_url?: string;
}

interface Fields {
    query_id: string;
    user: string;
    auth_date: string;
    signature: string;
}

export default function makeInitData(webUrl: string) {

  const usId = Number(localStorage.getItem('_tg_current_user'))
  const users = JSON.parse(localStorage.getItem('_tg_users') || '[]')

  const userData = users.find((u: any) => u.id === usId) || {}
  
  const hasNotName = !userData.first_name && !userData.last_name
  
  const user: User = {
    id: userData.id || 1234567890,
    first_name: hasNotName ? 'Test' : userData.first_name ||  "",
    last_name: userData.last_name || "",
    username: userData.username || "",
    language_code: "en",
    allows_write_to_pm: true,
    photo_url: userData.photo_url || "",
  };
  
  const botId = localStorage.getItem('_tg_current_bot')
  const bots = JSON.parse(localStorage.getItem('_tg_bots') || '[]')
  
  const botData = bots.find((b: any) => b.id === botId) || { token: '123456789:abcDefGH-JklmM0opQ5RStuvWxyz' }
  const botToken = botData.token

  const query_id: string = "AAGTxYhxAwAAAJPFiHGWuU3c";
  const auth_date: number = Math.floor(Date.now() / 1000);
  const signature: string = "Rxyyhytg35hrse8jc73HC53y97gh5g95bons47jbr4d864";

  const fields: Fields = {
    query_id,
    user: JSON.stringify(user),
    auth_date: String(auth_date),
    signature,
  };

  const sortedKeys = Object.keys(fields).sort() as (keyof Fields)[]
  const dataCheckString = sortedKeys.map((k) => `${k}=${fields[k]}`).join("\n");

  const secretKey = CryptoJS.HmacSHA256(botToken, "WebAppData");
  const hash = CryptoJS.HmacSHA256(dataCheckString, secretKey).toString(CryptoJS.enc.Hex);

  const encodedParts = sortedKeys.map((k) => `${k}=${encodeURIComponent(fields[k])}`);
  encodedParts.push(`hash=${hash}`);
  const init_data = encodedParts.join("&");
  
  const white = !(document as any).documentElement.classList.contains("dark")
  console.log(white && 'itsWhite')
  const bg = white ? '#ffffff' : '#000000'
  const tc = white ? '#000000' : '#ffffff'
  
  const themeParams = {
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
  };

  const url: string = `${webUrl}${webUrl.endsWith('/') ? '' : '/'}#tgWebAppData=${encodeURIComponent(init_data)}&tgWebAppVersion=9.1&tgWebAppPlatform=android&tgWebAppThemeParams=${encodeURIComponent(
    JSON.stringify(themeParams)
  )}`;

  return { data: url, themeParams };
}
