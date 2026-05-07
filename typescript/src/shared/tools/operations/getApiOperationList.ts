import { z } from 'zod';
import { DevelopersApi, Tool, ToolContext } from '@/shared/types';

const getDescription = (context: ToolContext): string => {
  const baseDescription = `Provides a summary of all API operations for a specific Mastercard API 
specification including HTTP methods, request paths, titles, and descriptions.`;

  if (context.apiSpecificationPath) {
    return `${baseDescription}

Uses the configured API specification: ${context.apiSpecificationPath}`;
  }

  return `${baseDescription}

It takes one argument:
- apiSpecificationPath (str): The path to the API specification file e.g., '/open-finance-us/swagger/openbanking-us.yaml')`;
};

export const getParameters = (context: ToolContext): z.ZodObject<any> => {
  if (context.apiSpecificationPath) {
    return z.object({});
  }

  return z.object({
    apiSpecificationPath: z
      .string()
      .startsWith('/')
      .describe(
        'The path to the API specification file (e.g., /open-finance-us/swagger/openbanking-us.yaml)'
      ),
  });
};

export const execute = async (
  context: ToolContext,
  developersApi: DevelopersApi,
  params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  if (context.apiSpecificationPath) {
    return await developersApi.getApiOperations(context.apiSpecificationPath);
  } else {
    return await developersApi.getApiOperations(params.apiSpecificationPath);
  }
};

export const getApiOperationList = (
  context: ToolContext,
  developersApi: DevelopersApi
): Tool => ({
  name: 'get-api-operation-list',
  title: 'Get API Operation List',
  description: getDescription(context),
  parameters: getParameters(context),
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  execute: (params) => execute(context, developersApi, params),
});
