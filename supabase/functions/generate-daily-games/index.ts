import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GameData {
  game_type: string;
  title: string;
  description: string;
  data: Record<string, unknown>;
  points_reward: number;
}

async function generateGamesWithAI(): Promise<GameData[]> {
  const prompt = `Tu es un générateur de jeux de réflexion pour une application sociale francophone. Génère exactement 3 jeux différents au format JSON.

Les types de jeux possibles sont :
1. "word_scramble" - Un mot mélangé que l'utilisateur doit retrouver
2. "math_puzzle" - Un problème de mathématiques avec 4 options de réponse
3. "pattern" - Une suite logique (nombres ou lettres) à compléter avec 4 options

Pour chaque jeu, utilise ce format exact :
{
  "game_type": "word_scramble" | "math_puzzle" | "pattern",
  "title": "Titre court et accrocheur",
  "description": "Description courte du défi",
  "points_reward": 10 | 15 | 20,
  "data": { ... }
}

Format du champ "data" selon le type :
- word_scramble: { "scrambled": "LETTRES MÉLANGÉES", "answer": "MOT CORRECT", "hint": "Un indice utile" }
- math_puzzle: { "question": "L'énoncé du problème", "options": ["A", "B", "C", "D"], "answer": "La bonne réponse parmi les options", "explanation": "Explication courte" }
- pattern: { "question": "Trouvez le prochain élément", "sequence": ["1", "2", "3"], "options": ["A", "B", "C", "D"], "answer": "La bonne réponse", "explanation": "Explication de la logique" }

Règles importantes :
- Les mots pour word_scramble doivent être des mots français courants (6-10 lettres)
- Les problèmes math doivent être accessibles mais intéressants (niveau collège/lycée)
- Les suites logiques doivent avoir une logique claire
- Varie les difficultés : 10 pts (facile), 15 pts (moyen), 20 pts (difficile)
- Génère exactement 1 jeu de chaque type
- Les lettres mélangées doivent être vraiment mélangées (pas dans le même ordre que la réponse)

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in AI response");
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const games: GameData[] = JSON.parse(jsonStr);

  // Validate each game
  for (const game of games) {
    if (!game.game_type || !game.title || !game.data || !game.data.answer) {
      throw new Error(`Invalid game structure: ${JSON.stringify(game)}`);
    }
  }

  return games;
}

function generateFallbackGames(): GameData[] {
  const wordBank = [
    { answer: "AVENTURE", hint: "Un voyage excitant" },
    { answer: "CHOCOLAT", hint: "Une douceur sucrée" },
    { answer: "MUSIQUE", hint: "Art des sons harmonieux" },
    { answer: "PLANETE", hint: "Corps céleste en orbite" },
    { answer: "COURAGE", hint: "Force face au danger" },
    { answer: "LUMIERE", hint: "Ce qui éclaire" },
    { answer: "MYSTERE", hint: "Ce qui est caché" },
    { answer: "SILENCE", hint: "Absence de bruit" },
    { answer: "LIBERTE", hint: "État de celui qui est libre" },
    { answer: "BONHEUR", hint: "État de satisfaction" },
    { answer: "HORIZON", hint: "Ligne où ciel et terre se rencontrent" },
    { answer: "ETOILES", hint: "Elles brillent la nuit" },
    { answer: "TABLEAU", hint: "Œuvre d'art peinte" },
    { answer: "JARDIN", hint: "Espace cultivé avec des plantes" },
    { answer: "VOYAGE", hint: "Déplacement vers un lieu lointain" },
  ];

  const mathProblems = [
    { question: "Si 3x + 7 = 22, que vaut x ?", options: ["3", "5", "7", "4"], answer: "5", explanation: "3x = 22 - 7 = 15, donc x = 5" },
    { question: "Quel est 15% de 200 ?", options: ["25", "30", "35", "20"], answer: "30", explanation: "15/100 × 200 = 30" },
    { question: "√144 + √25 = ?", options: ["15", "17", "13", "19"], answer: "17", explanation: "√144 = 12 et √25 = 5, donc 12 + 5 = 17" },
    { question: "2⁵ - 3² = ?", options: ["21", "23", "25", "19"], answer: "23", explanation: "2⁵ = 32 et 3² = 9, donc 32 - 9 = 23" },
    { question: "Combien font 7 × 8 - 6 × 4 ?", options: ["28", "32", "36", "24"], answer: "32", explanation: "56 - 24 = 32" },
    { question: "Si un triangle a des angles de 45° et 90°, quel est le 3ème angle ?", options: ["35°", "45°", "55°", "65°"], answer: "45°", explanation: "180 - 45 - 90 = 45°" },
    { question: "Quel est le PGCD de 24 et 36 ?", options: ["6", "8", "12", "4"], answer: "12", explanation: "Les diviseurs communs: 1,2,3,4,6,12. Le plus grand est 12" },
    { question: "3! + 4! = ?", options: ["27", "30", "24", "18"], answer: "30", explanation: "3! = 6, 4! = 24, donc 6 + 24 = 30" },
  ];

  const patterns = [
    { question: "Quelle est la suite ?", sequence: ["2", "6", "18", "54", "?"], options: ["108", "162", "72", "216"], answer: "162", explanation: "Chaque nombre est multiplié par 3" },
    { question: "Complétez la suite", sequence: ["1", "1", "2", "3", "5", "?"], options: ["7", "8", "6", "9"], answer: "8", explanation: "Suite de Fibonacci : chaque nombre = somme des 2 précédents" },
    { question: "Quel nombre suit ?", sequence: ["3", "7", "15", "31", "?"], options: ["47", "55", "63", "59"], answer: "63", explanation: "Chaque nombre = précédent × 2 + 1" },
    { question: "Trouvez le suivant", sequence: ["1", "4", "9", "16", "25", "?"], options: ["30", "36", "42", "49"], answer: "36", explanation: "Ce sont les carrés parfaits : 1², 2², 3², 4², 5², 6²" },
    { question: "Quelle est la logique ?", sequence: ["100", "95", "85", "70", "?"], options: ["50", "55", "60", "45"], answer: "50", explanation: "On soustrait 5, 10, 15, 20... (-5 de plus à chaque fois)" },
    { question: "Complétez", sequence: ["A", "C", "F", "J", "?"], options: ["M", "N", "O", "P"], answer: "O", explanation: "On avance de +2, +3, +4, +5 lettres dans l'alphabet" },
    { question: "Suite à compléter", sequence: ["2", "3", "5", "7", "11", "?"], options: ["12", "13", "14", "15"], answer: "13", explanation: "Ce sont les nombres premiers consécutifs" },
  ];

  // Pick random items
  const wordIdx = Math.floor(Math.random() * wordBank.length);
  const mathIdx = Math.floor(Math.random() * mathProblems.length);
  const patternIdx = Math.floor(Math.random() * patterns.length);

  const word = wordBank[wordIdx];
  const scrambled = word.answer.split("").sort(() => Math.random() - 0.5).join("");

  return [
    {
      game_type: "word_scramble",
      title: "Mot Mystère",
      description: "Retrouvez le mot caché !",
      points_reward: 10,
      data: { scrambled, answer: word.answer, hint: word.hint },
    },
    {
      game_type: "math_puzzle",
      title: "Défi Mathématique",
      description: "Résolvez ce problème !",
      points_reward: 15,
      data: mathProblems[mathIdx],
    },
    {
      game_type: "pattern",
      title: "Suite Logique",
      description: "Trouvez le motif !",
      points_reward: 20,
      data: patterns[patternIdx],
    },
  ];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if there are already active games
    const { data: existingGames } = await supabase
      .from("daily_games")
      .select("id")
      .gte("expires_at", new Date().toISOString())
      .lte("starts_at", new Date().toISOString());

    if (existingGames && existingGames.length >= 3) {
      return new Response(
        JSON.stringify({ message: "Active games already exist", count: existingGames.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try AI generation first, fallback to static pool
    let games: GameData[];
    try {
      games = await generateGamesWithAI();
      console.log("Games generated with AI");
    } catch (aiError) {
      console.error("AI generation failed, using fallback:", aiError);
      games = generateFallbackGames();
      console.log("Games generated with fallback");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours

    const gamesToInsert = games.map((game) => ({
      game_type: game.game_type,
      title: game.title,
      description: game.description,
      data: game.data,
      points_reward: game.points_reward,
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }));

    const { data, error } = await supabase
      .from("daily_games")
      .insert(gamesToInsert)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ message: "Games generated successfully", games: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating games:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
