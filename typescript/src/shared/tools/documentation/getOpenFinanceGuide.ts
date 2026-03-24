import { z } from 'zod';
import { Tool, ToolContext } from '@/shared/types';
import api from '@/shared/api';

const getDescription = (_context: ToolContext): string => {
  return `Retrieves the comprehensive Open Finance (previously known as Open Banking) integration 
guide including setup instructions, API usage examples, and implementation best practices.`;
};

export const getParameters = (_context: ToolContext): z.ZodObject<any> => {
  return z.object({});
};

export const execute = async (
  _context: ToolContext,
  _params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  return await api.getDocumentationPage(
    '/open-finance-us/documentation/quick-start-guide/index.md'
  );
};

export const getOpenFinanceGuide = (context: ToolContext): Tool => ({
  name: 'get-openfinance-integration-guide',
  title: 'Get Open Finance Integration Guide',
  description: getDescription(context),
  parameters: getParameters(context),
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  execute: (params) => execute(context, params),
});
