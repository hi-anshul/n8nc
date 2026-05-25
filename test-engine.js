const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// The database ID the user tested earlier
const NOTION_DATABASE_ID = '36bb424391c7806dae8cd952ca6aaed5';

async function runTest() {
  console.log('1. Fetching your Notion Credential...');
  const { data: credentials, error: credError } = await supabase
    .from('credentials')
    .select('*')
    .limit(1);

  if (credError || !credentials || credentials.length === 0) {
    console.error('No credentials found! Please add one in the UI first.');
    return;
  }
  const credential = credentials[0];
  console.log(`✅ Found credential: ${credential.label} (${credential.id})`);

  console.log('\n2. Creating a test Workflow directly in the database...');
  const triggerSlug = 'test-webhook-' + Date.now();
  
  // Create a minimal graph
  const graph = {
    nodes: [
      {
        id: 'node-trigger',
        type: 'form_trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Webhook', config: {} }
      },
      {
        id: 'node-notion',
        type: 'notion_create_page',
        position: { x: 300, y: 0 },
        data: {
          label: 'Create Notion Page',
          config: {
            credentialId: credential.id,
            databaseId: NOTION_DATABASE_ID,
            fieldMappings: [
              {
                notionProperty: 'Name',
                notionType: 'title',
                valueSource: 'trigger_field',
                triggerField: 'message' // We will send { message: "..." } in the webhook
              }
            ]
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-trigger',
        target: 'node-notion'
      }
    ]
  };

  const { data: workflow, error: wfError } = await supabase
    .from('workflows')
    .insert({
      user_id: credential.user_id,
      name: 'Engine Test Workflow',
      is_active: true,
      trigger_slug: triggerSlug,
      graph: graph
    })
    .select()
    .single();

  if (wfError) {
    console.error('Failed to create workflow:', wfError);
    return;
  }
  console.log(`✅ Created active workflow: ${workflow.name} (Trigger Slug: ${triggerSlug})`);

  console.log('\n3. Simulating an incoming Webhook POST request...');
  const webhookUrl = `http://localhost:3000/api/trigger/${triggerSlug}`;
  console.log(`Firing POST to ${webhookUrl}...`);
  
  const payload = { message: 'Hello from the Automated Execution Engine Test!' };
  
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    console.log(`✅ Webhook Response:`, result);
  } catch (err) {
    console.error('Webhook fetch failed:', err.message);
  }

  console.log('\n4. Waiting 3 seconds for the engine to finish processing...');
  await new Promise(r => setTimeout(r, 3000));

  console.log('\n5. Fetching execution logs from the database...');
  const { data: executions, error: execError } = await supabase
    .from('executions')
    .select('*')
    .eq('workflow_id', workflow.id)
    .order('started_at', { ascending: false })
    .limit(1);

  if (execError || !executions || executions.length === 0) {
    console.log('❌ No execution found in database.');
    return;
  }

  const execution = executions[0];
  console.log(`\n================ EXECUTION RESULT ================`);
  console.log(`Status:  ${execution.status.toUpperCase()}`);
  console.log(`Started: ${execution.started_at}`);
  console.log(`Data:`);
  console.log(JSON.stringify(execution.node_results, null, 2));
  console.log(`==================================================`);
  
  if (execution.status === 'success') {
    console.log('\n🎉 SUCCESS! The engine successfully traversed the graph, executed the Notion node, and saved the state!');
    console.log('Check your Notion Database, you should see a new row!');
  } else {
    console.log('\n❌ Execution failed. Check the errors above.');
  }
}

runTest();
