export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { productName } = req.body;
  if (!productName) return res.status(400).json({ error: "productName required" });

  // ── Step 1: Open Pet Food Facts ──────────────────────────────────────────
  try {
    const opffRes = await fetch(
      `https://world.openpetfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&tagtype_0=categories&tag_contains_0=contains&tag_0=dog-food&fields=code,product_name,ingredients_text&search_simple=1&action=process&json=1&page_size=5`
    );
    const opffData = await opffRes.json();
    const match = (opffData.products || []).find(p => p.ingredients_text);
    if (match) {
      return res.status(200).json({ ingredients: match.ingredients_text, source: "opff" });
    }
  } catch {}

  // ── Step 2: Chewy scrape ─────────────────────────────────────────────────
  try {
    const searchUrl = `https://www.chewy.com/s?query=${encodeURIComponent(productName)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      }
    });
    const searchHtml = await searchRes.text();

    // Extract first product URL from search results
    const productUrlMatch = searchHtml.match(/href="(\/[^"]+dp\/\d+[^"]*)"/);
    if (productUrlMatch) {
      const productUrl = `https://www.chewy.com${productUrlMatch[1].split('"')[0]}`;
      const productRes = await fetch(productUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
      });
      const productHtml = await productRes.text();

      // Try to extract ingredients section
      const ingPatterns = [
        /Ingredients[:\s]*<\/[^>]+>\s*<[^>]+>([^<]{50,2000})/i,
        /"ingredients"[:\s]+"([^"]{50,2000})"/i,
        /Ingredients<\/strong>[^<]*<[^>]+>([^<]{50,2000})/i,
        /id="ingredients"[^>]*>[\s\S]{0,200}?<p[^>]*>([^<]{50,2000})/i,
      ];

      for (const pattern of ingPatterns) {
        const match = productHtml.match(pattern);
        if (match && match[1]) {
          const cleaned = match[1].replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim();
          if (cleaned.length > 30) {
            return res.status(200).json({ ingredients: cleaned, source: "chewy" });
          }
        }
      }
    }
  } catch {}

  // ── Step 3: Claude AI fallback ───────────────────────────────────────────
  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `What are the ingredients for the dog food product "${productName}"?

RULES:
- Only respond if you have reliable knowledge of this specific product's actual ingredients
- Return ONLY the ingredients list as a comma-separated string, exactly as it would appear on the label
- If you are not confident about the exact ingredients for this specific product, respond with exactly: UNKNOWN
- Do not include any explanation, preamble, or additional text`
        }]
      })
    });
    const claudeData = await claudeRes.json();
    const text = (claudeData.content || []).map(c => c.text || "").join("").trim();
    if (text && text !== "UNKNOWN" && text.length > 20) {
      return res.status(200).json({ ingredients: text, source: "ai", aiDisclaimer: true });
    }
  } catch {}

  // ── All failed ───────────────────────────────────────────────────────────
  return res.status(200).json({ ingredients: null, source: "none" });
}
