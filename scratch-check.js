const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local in the workspace root
const envPath = './.env.local';
if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local file");
  process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkflow() {
  const workflowId = '89190a81-5f87-47b3-9872-87ee1dfe86e2';
  const { data: workflow, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single();

  if (error) {
    console.error("Error fetching workflow:", error);
    return;
  }

  console.log(`Workflow Name: ${workflow.name}`);
  console.log(`Nodes:`, JSON.stringify(workflow.graph.nodes, null, 2));
  console.log(`Edges:`, JSON.stringify(workflow.graph.edges, null, 2));
}

checkWorkflow();
