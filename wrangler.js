const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    try {
      const { searchParams } = new URL(request.url);
      const slugData = searchParams.get("slug");

      if (!slugData) {
        return new Response(
          JSON.stringify({ error: "Missing slug" }),
          { status: 400, headers }
        );
      }
      
      const slug = slugData.startsWith('$') ? slugData.slice(1) : slugData

      const targetUrl = `https://t.me/$${slug}`;

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      const result = {};

      const rewriter = new HTMLRewriter()
        .on(".tgme_page_title", {
          text(text) {
            result.title = (result.title || "") + text.text;
          },
        })
        .on(".tgme_page_extra", {
          text(text) {
            result.stars = (result.stars || "") + text.text;
          },
        })
        .on(".tgme_page_description", {
          text(text) {
            result.desc = (result.desc || "") + text.text;
          },
        });

      await rewriter.transform(response).text();

      if (result.title) {
        result.title = result.title.trim();
      }

      if (result.desc) {
        result.desc = result.desc.trim();
      }

      if (result.stars) {
        result.stars = result.stars.replace("⭐️", "").trim();
      }
      
      if (!result.title && !result.desc && !result.stars) {
        return new Response(
          JSON.stringify({ error: "Invoice not found" }),
          { status: 404, headers }
        );
      }

      return new Response(JSON.stringify(result), {
        headers
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers }
      );
    }
  },
};