import { ExecutionContext } from '../index';

export interface FormTriggerConfig {
  webhookUrl?: string;
}

export async function execute(config: FormTriggerConfig, context: ExecutionContext) {
  // Form trigger simply forwards input payload
  return {
    status: 'success',
    output: context.triggerData
  };
}
