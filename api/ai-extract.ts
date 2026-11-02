import { GoogleGenAI } from '@google/genai';

/**
 * Vercel Serverless Function Proxy for AI OCR Extraction
 * Keeps GEMINI_API_KEY secure on the server side without any VITE_ prefix.
 */
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'prima-ocr-engine',
        },
      },
    });
  }
  return genAIClient;
}

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { documentText, prompt, imageBase64, mimeType } = req.body || {};
    const ai = getGenAI();

    if (!ai) {
      return res.status(200).json({
        success: false,
        fallback: true,
        warning: 'GEMINI_API_KEY belum dikonfigurasi di environment secret.',
        data: null,
      });
    }

    const systemInstruction = `You are an elite PMO Document Intelligence and Technical/Financial Construction Auditor specializing in Indonesian engineering standards, PLN/BUMN projects, BAPL (Berita Acara Peninjauan Lapangan), Justifikasi Teknis (JusTek), Justifikasi Finansial (JusFin), and RAB/BOQ documents.

ABSOLUTE EXHAUSTIVE EXTRACTION MANDATE:
1. READ 100% OF ALL DATA ACROSS ALL ROWS, COLUMNS, SECTIONS, AND PAGES FROM START TO FINISH.
2. NEVER skip, collapse, truncate, or sample rows or pages.
3. READ ALL INK COLORS AND HANDWRITING VARIANTS:
   - BLUE BALLPOINT INK: Site supervisor notes, revisions, signatures.
   - RED INK / MARKUPS: Crossed out numbers and corrected quantities.
   - BLACK INK: Field opname tables, dimensions, contractor remarks.
   - OFFICIAL STAMPS: Stamped company seals, approval dates.
4. Extract every line item faithfully with exact quantities, units, and specs.
5. Return clean JSON matching the requested schema.`;

    let contents: any;
    if (imageBase64) {
      const fullPrompt = documentText
        ? `${prompt || 'BACA 100% SELURUH ISI DOKUMEN BAPL VISUAL INI SECARA LENGKAP'}\n\n[REFERENSI LAPISAN TEKS DIGITAL]:\n${documentText}`
        : (prompt || 'BACA 100% SELURUH ISI DOKUMEN BAPL VISUAL INI SECARA LENGKAP');

      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      };
    } else {
      contents = `${prompt || 'Analyze document text exhaustively:'}\n\nDOCUMENT TEXT:\n${documentText || ''}`;
    }

    let responseText = '';
    const candidateModels = [
      'gemini-3.1-pro-preview',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} error:`, err?.message || err);
      }
    }

    if (!responseText || responseText.trim() === '' || responseText === '{}') {
      return res.status(200).json({
        success: false,
        fallback: true,
        warning: 'AI Cloud model limit reached. Activating local Tesseract fallback.',
        data: null,
      });
    }

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanJson);
    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.error('Serverless AI Extract error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal AI Extraction Error',
    });
  }
}
