import axios from "axios";

interface PriceResult {
  title?: string
  desc?: string
  stars?: string
  error?: string; 
}

export default async function fetchInvoice(slug: string): Promise<PriceResult> {
  try {
    const response = await axios.get(`https://get-tg-invoice.theogmh.workers.dev`, {
        params: {
            slug
        }
    });
    
    const { title, desc, stars } = response.data
    
    console.log(title, desc, stars)
    
    return { title, desc, stars  };
  } catch (err: any) {
    console.log(err.response)
    return { error: err.response?.data?.error || err.message || 'Failed to open Invoice' };
  }
}