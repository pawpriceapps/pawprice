export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { productName } = req.body;
  if (!productName) return res.status(400).json({ error: 'productName required' });

  // ── Step 1: Claude AI (most reliable for known brands) ───────────────────
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `List the ingredients for the dog food product: "${productName}"

Return ONLY a comma-separated list of ingredients as they appear on the label. No intro, no explanation, no markdown.

If this is a real commercial dog food you have knowledge of, always return the ingredient list.
Only return the word UNKNOWN if this is completely unrecognizable as a real product.`
        }]
      })
    });

    const claudeData = await claudeRes.json();

    // Log for debugging
    console.log('Claude response:', JSON.stringify(claudeData));

    if (claudeData.error) {
      return res.status(200).json({ ingredients: null, source: 'none', debug: claudeData.error });
    }

    const text = (claudeData.content || []).map(c => c.text || '').join('').trim();

    if (text && text !== 'UNKNOWN' && text.length > 20) {
      return res.status(200).json({ ingredients: text, source: 'ai', aiDisclaimer: true });
    }
  } catch (err) {
    console.error('Claude error:', err.message);
  }

  // ── Step 2: Open Pet Food Facts ──────────────────────────────────────────
  try {
    const opffRes = await fetch(
      `https://world.openpetfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&tagtype_0=categories&tag_contains_0=contains&tag_0=dog-food&fields=code,product_name,ingredients_text&search_simple=1&action=process&json=1&page_size=5`
    );
    const opffData = await opffRes.json();
    const match = (opffData.products || []).find(p => p.ingredients_text);
    if (match) {
      return res.status(200).json({ ingredients: match.ingredients_text, source: 'opff' });
    }
  } catch (err) {
    console.error('OPFF error:', err.message);
  }

  return res.status(200).json({ ingredients: null, source: 'none' });
}
