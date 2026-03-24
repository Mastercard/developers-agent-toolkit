import { z } from 'zod';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

export interface Tool {
  name: string;
  title: string;
  description: string;
  parameters: z.ZodObject<any>;
  annotations: ToolAnnotations;
  execute: (params: any) => Promise<string>;
}

export interface ToolContext {
  serviceId?: string;
  apiSpecificationPath?: string;
}
