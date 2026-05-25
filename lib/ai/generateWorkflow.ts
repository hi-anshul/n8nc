import { GoogleGenAI, Type, Schema } from '@google/genai';
import { WorkflowGraph } from '@/types/workflow';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are n8nc's AI engine. Your job is to convert a plain English automation description into a structured workflow graph.

You must output ONLY valid JSON matching the provided schema. No explanation, no markdown, no preamble.

Available node types: form_trigger, notion_create_page, notion_update_page, condition, delay

Node placement rules:
- form_trigger always at position { x: 100, y: 200 }
- Each subsequent node 300px to the right of the previous
- Leave config values as sensible defaults or empty strings — the user will fill them in

Always start with a form_trigger node. Generate IDs as "node_1", "node_2", etc.
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
            enum: ["form_trigger", "notion_create_page", "notion_update_page", "condition", "delay"]
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
