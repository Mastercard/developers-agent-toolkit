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

export interface DevelopersApi {
  listServices(): Promise<string>;
  getDocumentation(serviceId: string): Promise<string>;
  getDocumentationSection(
    serviceId: string,
    sectionId: string
  ): Promise<string>;
  getDocumentationPage(pagePath: string): Promise<string>;
  getApiOperations(apiSpecificationPath: string): Promise<string>;
  getApiOperationDetails(
    apiSpecificationPath: string,
    method: string,
    path: string
  ): Promise<string>;
}

export interface ToolContext {
  serviceId?: string;
  apiSpecificationPath?: string;
}
