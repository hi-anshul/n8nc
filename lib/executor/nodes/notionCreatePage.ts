import { ExecutionContext, NodeResult } from '@/types/executor';
import { decryptToken } from '@/lib/crypto';
import { createNotionPage } from '@/lib/notion/client';

export interface NotionCreatePageConfig {
  credentialId?: string;
  databaseId?: string;
  fieldMappings?: Array<{
    notionProperty: string;
    notionType: string;
    valueSource: 'trigger_field' | 'static';
    triggerField?: string;
    staticValue?: string;
  }>;
}

export async function execute(
  config: Record<string, unknown>,
  context: ExecutionContext
): Promise<NodeResult> {
  const notionConfig = config as unknown as NotionCreatePageConfig;

  if (!notionConfig.credentialId) {
    return { status: 'error', error: 'Missing credential ID in node configuration.' };
  }
  if (!notionConfig.databaseId) {
    return { status: 'error', error: 'Missing database ID in node configuration.' };
  }

  try {
    // 1. Fetch credential from DB using the provided supabase client
    const { data: credData, error: credError } = await context.supabase
      .from('credentials')
      .select('encrypted_token')
      .eq('id', notionConfig.credentialId)
      .single();

    if (credError || !credData) {
      return { status: 'error', error: 'Failed to retrieve Notion credential. Ensure the credential exists and belongs to the workflow owner.' };
    }

    // 2. Decrypt Token
    const token = decryptToken(credData.encrypted_token);

    // 3. Construct properties payload for Notion
    const properties: Record<string, any> = {};

    for (const mapping of notionConfig.fieldMappings || []) {
      if (!mapping.notionProperty || !mapping.notionType) continue;

      // Determine the raw value
      let rawValue: any = null;
      if (mapping.valueSource === 'trigger_field' && mapping.triggerField) {
        rawValue = context.triggerData[mapping.triggerField];
      } else if (mapping.valueSource === 'static') {
        rawValue = mapping.staticValue;
      }

      if (rawValue === undefined || rawValue === null) {
        // Skip if there's no value to map
        continue;
      }

      // Map to Notion's specific property schema
      switch (mapping.notionType) {
        case 'title':
          properties[mapping.notionProperty] = {
            title: [{ text: { content: String(rawValue) } }],
          };
          break;
        case 'rich_text':
          properties[mapping.notionProperty] = {
            rich_text: [{ text: { content: String(rawValue) } }],
          };
          break;
        case 'email':
          properties[mapping.notionProperty] = {
            email: String(rawValue),
          };
          break;
        case 'select':
          properties[mapping.notionProperty] = {
            select: { name: String(rawValue) },
          };
          break;
        case 'number':
          properties[mapping.notionProperty] = {
            number: Number(rawValue),
          };
          break;
        default:
          // Fallback just passes the raw value
          properties[mapping.notionProperty] = rawValue;
      }
    }

    // 4. Create the page
    const result = await createNotionPage(token, notionConfig.databaseId, properties);

    return {
      status: 'success',
      output: result,
    };
  } catch (error: any) {
    console.error('[notionCreatePage] Node Execution Error:', error);
    return { status: 'error', error: error.message || 'Unknown error occurred in Notion node' };
  }
}
