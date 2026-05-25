import { Client } from '@notionhq/client';

/**
 * Creates a new page in a Notion database.
 * 
 * @param token The decrypted Notion Internal Integration Token
 * @param databaseId The ID of the database to create the page in
 * @param properties The formatted Notion properties object
 * @returns The created page object
 */
export async function createNotionPage(
  token: string,
  databaseId: string,
  properties: Record<string, unknown>
) {
  const notion = new Client({ auth: token });
  
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: properties as any,
    });
    
    return {
      status: 'success',
      pageId: response.id,
      // @ts-ignore - The Notion types don't strictly type the url property in all responses but it exists
      url: response.url,
    };
  } catch (error: any) {
    console.error('[Notion Client] createNotionPage Error:', error);
    throw new Error(`Notion API Error: ${error.message}`);
  }
}
