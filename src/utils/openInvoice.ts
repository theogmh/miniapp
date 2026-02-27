import axios from "axios";

interface PriceResult {
  price: string | null;
  error?: string;
}

export default async function fetchInvoice(slug: string): Promise<PriceResult> {
  try {
    const response = await axios.get(`https://corsproxy.io/?url=https://t.me/$${slug}`, { responseType: "text" });
    const htmlText = response.data;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const titleElm = doc.querySelector(".tgme_page_title")
    const title = titleElm?.textContent?.trim?.()
    
    const starsElm = doc.querySelector(".tgme_page_extra")
    const stars = starsElm?.textContent?.trim?.()
    
    const descElm = doc.querySelector(".tgme_page_description")
    const desc = descElm?.textContent?.trim?.()
    
    console.log(title, desc, stars)
    
    return { title, desc, stars: stars ? stars.replace('⭐️', '') : stars  };
  } catch (err: any) {
    return { error: err.message };
  }
}