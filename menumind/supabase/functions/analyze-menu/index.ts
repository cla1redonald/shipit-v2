// Supabase Edge Function: analyze-menu
// Proxies menu photo analysis through Claude Vision API
// Keeps ANTHROPIC_API_KEY server-side (never on the client)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface AnalysisRequest {
  scanId: string;
  imageUrl: string;
  dietaryProfile: {
    allergies: string[];
    dietTypes: string[];
    severityLevels: Record<string, string>;
    customRestrictions: string[];
  };
}

interface DishAnalysis {
  dish_name: string;
  original_name: string | null;
  classification: 'safe' | 'caution' | 'avoid';
  confidence: 'high' | 'medium' | 'low';
  likely_ingredients: string[];
  allergens_detected: string[];
  modification_suggestions: string[];
  server_prompts: string[];
  reasoning: string;
}

interface ClaudeResponse {
  restaurant_name: string | null;
  language_detected: string | null;
  menu_readable: boolean;
  error_message: string | null;
  dishes: DishAnalysis[];
}

Deno.serve(async (req: Request) => {
  try {
    const { scanId, imageUrl, dietaryProfile } = (await req.json()) as AnalysisRequest;

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update scan status to analyzing
    await supabase
      .from('scans')
      .update({ status: 'analyzing' })
      .eq('id', scanId);

    // Fetch the image from Supabase Storage
    const { data: imageData } = await supabase.storage
      .from('menu-photos')
      .download(imageUrl);

    if (!imageData) {
      throw new Error('Failed to fetch image from storage');
    }

    // Convert to base64
    const buffer = await imageData.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Build the prompt
    const systemPrompt = buildSystemPrompt(dietaryProfile);

    // Call Claude API
    const claudeResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: 'Analyze this restaurant menu photo. Classify every dish based on the dietary profile in the system prompt. Return your analysis as JSON.',
              },
            ],
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      throw new Error(`Claude API error: ${claudeResponse.status} ${errorBody}`);
    }

    const claudeResult = await claudeResponse.json();
    const responseText = claudeResult.content?.[0]?.text || '';

    // Parse JSON from Claude's response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Claude response');
    }

    const analysis: ClaudeResponse = JSON.parse(jsonMatch[0]);

    // Store raw response
    await supabase
      .from('scans')
      .update({
        status: analysis.menu_readable ? 'complete' : 'error',
        restaurant_name: analysis.restaurant_name,
        language_detected: analysis.language_detected,
        raw_api_response: claudeResult,
        item_count: analysis.dishes.length,
        error_code: analysis.menu_readable ? null : 'UNREADABLE_IMAGE',
        error_message: analysis.error_message,
      })
      .eq('id', scanId);

    // Store individual dish results
    if (analysis.dishes.length > 0) {
      const scanItems = analysis.dishes.map((dish, index) => ({
        scan_id: scanId,
        dish_name: dish.dish_name,
        original_name: dish.original_name,
        classification: dish.classification,
        confidence: dish.confidence,
        likely_ingredients: dish.likely_ingredients,
        allergens_detected: dish.allergens_detected,
        modification_suggestions: dish.modification_suggestions,
        server_prompts: dish.server_prompts,
        reasoning: dish.reasoning,
        sort_order: index,
      }));

      await supabase.from('scan_items').insert(scanItems);
    }

    return new Response(
      JSON.stringify({
        restaurantName: analysis.restaurant_name,
        languageDetected: analysis.language_detected,
        menuReadable: analysis.menu_readable,
        errorMessage: analysis.error_message,
        dishes: analysis.dishes.map((d) => ({
          dishName: d.dish_name,
          originalName: d.original_name,
          classification: d.classification,
          confidence: d.confidence,
          likelyIngredients: d.likely_ingredients,
          allergensDetected: d.allergens_detected,
          modificationSuggestions: d.modification_suggestions,
          serverPrompts: d.server_prompts,
          reasoning: d.reasoning,
        })),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function buildSystemPrompt(profile: AnalysisRequest['dietaryProfile']): string {
  const allergyList = profile.allergies.length > 0
    ? profile.allergies
        .map((a) => {
          const severity = profile.severityLevels[a] || 'moderate';
          return `- ${a} (severity: ${severity})`;
        })
        .join('\n')
    : 'None';

  const dietList = profile.dietTypes.length > 0
    ? profile.dietTypes.join(', ')
    : 'None';

  const customList = profile.customRestrictions.length > 0
    ? profile.customRestrictions.map((r) => `- ${r}`).join('\n')
    : 'None';

  return `You are a food safety analyst specializing in dietary restrictions and allergen identification. Your task is to analyze a restaurant menu photo and classify each dish based on the user's dietary profile.

## User's Dietary Profile

### Allergies (with severity):
${allergyList}

### Diet Types:
${dietList}

### Custom Restrictions:
${customList}

## Classification Rules

For each dish on the menu:
1. **safe** — The dish appears safe based on the menu description. No known allergens or dietary conflicts detected. Use "likely safe" reasoning — never guarantee safety.
2. **caution** — The dish might contain allergens or conflict with dietary restrictions, but it's uncertain. Common scenarios: sauce ingredients not listed, possible cross-contamination, common hidden ingredients (soy in sauces, dairy in bread, gluten in thickeners).
3. **avoid** — The dish clearly contains or very likely contains allergens or violates dietary restrictions based on the menu description.

## Confidence Levels
- **high** — Menu description explicitly lists ingredients that clearly match or conflict with the profile.
- **medium** — Reasonable inference based on dish name, cuisine type, and common preparation methods.
- **low** — Uncertain analysis. Menu description is vague, dish is unusual, or ingredients are ambiguous. Always recommend asking the server.

## Important Rules
- For severe allergies, err on the side of caution — classify as "caution" or "avoid" even when uncertain.
- For mild intolerances, be less aggressive — only flag clear conflicts.
- If the menu is in a foreign language, translate dish names and analyze ingredients.
- If the menu is unreadable (blurry, too dark, not a menu), set menu_readable to false.
- Never guarantee a dish is safe. Use language like "appears safe based on menu description."
- Consider hidden ingredients common in each cuisine type.
- Generate specific, actionable modification suggestions when possible.
- Generate server questions for medium/low confidence items.

## Output Format

Return a JSON object with this exact structure:
{
  "restaurant_name": "string or null if not visible on menu",
  "language_detected": "ISO 639-1 code or null",
  "menu_readable": true,
  "error_message": "string or null",
  "dishes": [
    {
      "dish_name": "English name",
      "original_name": "original language name or null",
      "classification": "safe|caution|avoid",
      "confidence": "high|medium|low",
      "likely_ingredients": ["ingredient1", "ingredient2"],
      "allergens_detected": ["allergen1"],
      "modification_suggestions": ["Ask for X without Y"],
      "server_prompts": ["Does this dish contain Z?"],
      "reasoning": "Brief explanation of classification"
    }
  ]
}

Respond ONLY with the JSON object, no additional text.`;
}
