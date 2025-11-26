// api/bible.js
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ message: "Reference is required" });
  }

  try {
    // Parse the reference (e.g., "Genesis 1:2" -> book: "Genesis", chapter: 1)
    const match = reference.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/);
    
    if (!match) {
      return res.status(400).json({ message: "Invalid reference format" });
    }

    const [, book, chapter] = match;

  // Try ESV API first if API key is available. Support both ESV_API_KEY (preferred) and legacy esv_api_key.
  const esvApiKey = process.env.ESV_API_KEY || process.env.esv_api_key;
    
    if (esvApiKey && esvApiKey !== 'IP') {
      try {
  const apiUrl = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(book + ' ' + chapter)}&include-headings=true&include-footnotes=false&include-verse-numbers=true&include-short-copyright=false&include-passage-references=true`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Token ${esvApiKey}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          return res.status(200).json({
            reference: data.canonical || reference,
            text: data.passages?.[0] || '',
            chapter: chapter,
            version: 'ESV'
          });
        }
      } catch (esvErr) {
        console.log("ESV API failed, falling back to Bible API:", esvErr.message);
      }
    }

  // Fallback to Bible API (free, no auth required)
  // Using bible-api.com with World English Bible translation
    const bibleApiUrl = `https://bible-api.com/${encodeURIComponent(book + ' ' + chapter)}?translation=web`;
    
    const response = await fetch(bibleApiUrl);

    if (!response.ok) {
      throw new Error(`Bible API returned ${response.status}`);
    }

    const data = await response.json();

    // Format the response
    let formattedText = '';
    if (data.verses && Array.isArray(data.verses)) {
      formattedText = data.verses.map(v => {
        return `[${v.verse}] ${v.text}`;
      }).join('\n\n');
    } else if (data.text) {
      formattedText = data.text;
    }

    return res.status(200).json({
      reference: data.reference || reference,
      text: formattedText || 'Chapter text not available',
      chapter: chapter,
      version: data.translation_name || 'WEB'
    });

  } catch (err) {
    console.error("Bible API error:", err);
    return res.status(500).json({ message: "Error fetching Bible chapter" });
  }
}
