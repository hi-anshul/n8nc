import { GoogleGenAI, Type, Schema } from '@google/genai';
import { WorkflowGraph } from '@/types/workflow';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are n8nc's AI engine. Your job is to convert a plain English automation description into a structured workflow graph.

You must output ONLY valid JSON matching the provided schema. No explanation, no markdown, no preamble.

Available node types:
1. \`form_trigger\`: A starting node that receives data from a webhook/form.
2. \`google_sheets_trigger\`: A starting node that receives row data when a Google Sheet is edited.
3. \`json_trigger\`: A starting node that allows users to send/paste a JSON payload directly from the canvas for execution.
4. \`gemini_text\`: An AI node that uses Gemini to generate text based on a prompt template (e.g. summarizing data).
5. \`notion_create_page\`: An action node that creates a page/row in a Notion database.
6. \`notion_update_page\`: An action node that updates an existing page in Notion.
7. \`google_sheets_append_row\`: An action node that appends a row to a Google Sheet.
8. \`condition\`: A routing node that branches logic based on rules.
9. \`delay\`: A utility node that pauses execution for a set time.

Node placement rules:
- form_trigger, google_sheets_trigger, or json_trigger always at position { x: 100, y: 200 }
- Each subsequent node 300px to the right of the previous
- Leave config values as sensible defaults or empty strings — the user will fill them in

Always start with a trigger node. Generate IDs as "node_1", "node_2", etc.
Edge IDs as "edge_1", "edge_2", etc.
`;

const workflowSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Short workflow name" },
    description: { type: Type.STRING, description: "One sentence summary" },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { 
            type: Type.STRING,
            enum: ["form_trigger", "google_sheets_trigger", "json_trigger", "gemini_text", "notion_create_page", "notion_update_page", "google_sheets_append_row", "condition", "delay"]
          },
          position: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER }
            },
            required: ["x", "y"]
          },
          data: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              description: { type: Type.STRING },
              config: {
                type: Type.OBJECT,
                description: "Node-specific configuration. Leave values as empty strings if unknown.",
                nullable: true,
              }
            },
            required: ["label", "description"]
          }
        },
        required: ["id", "type", "position", "data"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          source: { type: Type.STRING },
          target: { type: Type.STRING },
          sourceHandle: { type: Type.STRING, nullable: true },
          label: { type: Type.STRING, nullable: true }
        },
        required: ["id", "source", "target"]
      }
    }
  },
  required: ["name", "description", "nodes", "edges"]
};

export async function generateWorkflowFromPrompt(prompt: string): Promise<{
  name: string;
  description: string;
  graph: WorkflowGraph;
}> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: workflowSchema,
        temperature: 0.2, // Low temperature for more deterministic graph generation
      }
    });

    if (!response.text) {
      throw new Error('Gemini returned an empty response');
    }

    const data = JSON.parse(response.text);

    return {
      name: data.name,
      description: data.description,
      graph: {
        nodes: data.nodes,
        edges: data.edges,
      }
    };
  } catch (error) {
    console.error('[AI] Failed to generate workflow:', error);
    throw new Error('Failed to generate workflow from prompt');
  }
}
