import { ExecutionContext, NodeResult } from '@/types/executor';
import { decryptToken } from '@/lib/crypto';
import { GoogleGenAI } from '@google/genai';

export interface GeminiConfig {
  credentialId?: string;
  model?: string;
  prompt?: string;
}

export async function execute(
  config: Record<string, unknown>,
  context: ExecutionContext
): Promise<NodeResult> {
  const geminiConfig = config as unknown as GeminiConfig;

  if (!geminiConfig.credentialId) {
    return { status: 'error', error: 'Missing Gemini credential ID in node configuration.' };
  }
  if (!geminiConfig.prompt) {
    return { status: 'error', error: 'Missing prompt in node configuration.' };
  }

  try {
    // 1. Fetch credential from DB using the provided supabase client
    const { data: credData, error: credError } = await context.supabase
      .from('credentials')
      .select('encrypted_token')
      .eq('id', geminiConfig.credentialId)
      .single();

    if (credError || !credData) {
      return { status: 'error', error: 'Failed to retrieve Gemini credential. Ensure the credential exists and belongs to the workflow owner.' };
    }

    // 2. Decrypt Token (API Key)
    const apiKey = decryptToken(credData.encrypted_token);

    // 3. Prepare the prompt by interpolating variables from context
    // E.g. {{Name}} -> context.triggerData['Name']
    // E.g. {{node_1.text}} -> context.previousOutputs['node_1']?.output?.text
    let finalPrompt = geminiConfig.prompt;

    // Simple interpolator for {{triggerField}}
    // It looks for {{key}} and replaces it with context.triggerData[key]
    const matches = finalPrompt.match(/\{\{([^}]+)\}\}/g) || [];
    for (const match of matches) {
      const key = match.slice(2, -2).trim(); // Remove {{ and }}
      let value = '';

      if (key.includes('.')) {
        // Handle node output references like "node_1.output.text"
        const parts = key.split('.');
        let current: any = context.previousOutputs;
        for (const p of parts) {
          if (current && typeof current === 'object') {
            current = current[p];
          } else {
            current = undefined;
            break;
          }
        }
        if (current !== undefined) value = String(current);
      } else {
        // Fallback to triggerData for simple variables
        const val = context.triggerData[key];
        if (val !== undefined) value = String(val);
      }

      finalPrompt = finalPrompt.replace(match, value);
    }

    // 4. Initialize GenAI client and generate text
    const ai = new GoogleGenAI({ apiKey });
    
    const model = geminiConfig.model || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
    });

    return {
      status: 'success',
      output: {
        text: response.text,
        model: model,
      },
    };
  } catch (error: any) {
    console.error('[geminiText] Node Execution Error:', error);
    return { status: 'error', error: error.message || 'Unknown error occurred in Gemini node' };
  }
}
