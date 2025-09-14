import { supabase } from "@/constants/supabaseClient";

const N8N_WEBHOOK_URL = "https://n8n.astroroles.com/webhook/1d726710-bd84-4249-948d-9e62b4e1bbaf";

export const generateStarterCollections = async (userId: string, message: string) => {
  const { data: settings, error } = await supabase
    .from("usersettings")
    .select("id, name, language, level, reason")
    .eq("id", userId)
    .single();

  if (error || !settings) throw new Error("User settings not found");

  const createSystemPrompt = `You are a language tutor that generates starter vocabulary for new students. Task: - the user may have a message that should direct the theme of the collections - Create EXACTLY 1 collection of words and phrases. - Each collection should have ~25 items. - For each item, return both the English word/phrase and its translation in the target language. - Tailor word difficulty to the student's level (beginner = simple words, advanced = harder). - Tailor collection themes to the student's purpose (travel, work, casual, etc.). Student: Name: ${settings.name } Language: ${settings.language } Level: ${settings.level } Purpose: ${settings.reason } Output JSON ONLY in this format. DO NOT include any other text. Make sure this is valid JSON: { "collections": [ { "name": "Basics", "words": [ { "word": "Yes", "translated": "<translation>" }, { "word": "No", "translated": "<translation>" }, ... (about 25 items) ] }, { "name": "Greetings", "words": [...] } ] } Once again, verify that this is a valid JSON response and that it matches the specified format exactly.
`;

  const fullPrompt = `${createSystemPrompt}\n\nUser Message: ${message}`;
  const fullURL = N8N_WEBHOOK_URL + `?prompt=${encodeURIComponent(fullPrompt)}`;

  const response = await fetch(fullURL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`n8n request failed: ${response.statusText}`);
  }

  console.warn("Received response from n8n", response.text);
  // Step 1: Get raw response object 
  const data = await response.json();
  console.log("raw response:", data.content?.[0]?.text);

  // Step 2: Extract JSON string from Claude
  const rawText = data.content?.[0]?.text ?? "";
  if (!rawText) throw new Error("Claude did not return any text");

  // Step 3: Parse the string into a JS object
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    console.error("JSON parse error:", e, rawText);
    throw new Error("Invalid JSON from Claude");
  }

  console.log("parsed collections:", parsed.collections);

  // Step 4: Insert into Supabase
  for (const col of parsed.collections) {
    const { data: inserted, error: collError } = await supabase
      .from("collections")
      .insert([{ name: col.name, user_id: userId }])
      .select()
      .single();

    if (collError || !inserted) {
      console.error("Error inserting collection:", collError);
      continue;
    }

    await supabase.from("collections_to_words").insert(
      col.words.map((w: any) => ({
        collection_id: inserted.id,
        word_or_phrase: w.word,
        translated_word_or_phrase: w.translated,
        correct: 0,
        wrong: 0,
        last_ten: [],
      }))
    );
  }

  return { success: true };
};
