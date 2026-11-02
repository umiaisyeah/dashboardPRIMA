// Supabase Edge Function: ai-extract
// Deno runtime - Kunci GEMINI_API_KEY tersimpan aman di Supabase Secrets
// Deploy via: supabase functions deploy ai-extract --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          fallback: true,
          warning: "GEMINI_API_KEY belum disetel di Supabase Secrets.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { documentText, prompt, imageBase64, mimeType } = await req.json();

    const systemInstruction = `You are an elite PMO Document Intelligence and Technical/Financial Construction Auditor specializing in Indonesian engineering standards, PLN/BUMN projects, BAPL (Berita Acara Peninjauan Lapangan), Justifikasi Teknis (JusTek), Justifikasi Finansial (JusFin), and RAB/BOQ documents.
Read 100% of all data across all rows and pages, including blue ballpoint ink handwriting, red ink annotations, and official stamps. Return clean JSON.`;

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: mimeType || "image/jpeg",
          data: imageBase64,
        },
      });
    }

    const textPrompt = documentText
      ? `${prompt || "BACA 100% SELURUH ISI DOKUMEN BAPL INI SECARA LENGKAP"}\n\n[REFERENSI TEKS DIGITAL]:\n${documentText}`
      : (prompt || "BACA 100% SELURUH ISI DOKUMEN BAPL INI SECARA LENGKAP");
    parts.push({ text: textPrompt });

    // Multi-tier model fallback
    const models = [
      "gemini-3.1-pro-preview",
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
    ];

    let resultJson = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [{ parts }],
            generationConfig: {
              response_mime_type: "application/json",
            },
          }),
        });

        if (res.ok) {
          const geminiData = await res.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            let clean = candidateText.trim();
            if (clean.startsWith("```json")) {
              clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            } else if (clean.startsWith("```")) {
              clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }
            resultJson = JSON.parse(clean);
            break;
          }
        }
      } catch (e) {
        console.warn(`Model ${model} in Edge Function error:`, e);
      }
    }

    if (!resultJson) {
      return new Response(
        JSON.stringify({
          success: false,
          fallback: true,
          warning: "Model AI limit/sibuk. Mengaktifkan fallback Tesseract lokal.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: resultJson,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
