import { z } from 'zod';
import { DevelopersApi, Tool, ToolContext } from '@/shared/types';

const getDescription = (_context: ToolContext): string => {
  return `Lists all available Mastercard Developers Products and Services with their basic information
including title, description, and service id.
IMPORTANT: The response contains both 'Products' (business offerings) and 'Services' (technical APIs with serviceIds). Use "serviceId" for each service for any tools that require serviceId as the parameter.
`;
};

export const getParameters = (_context: ToolContext): z.ZodObject<any> => {
  return z.object({});
};

export const execute = async (
  _context: ToolContext,
  developersApi: DevelopersApi,
  _params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  return await developersApi.listServices();
};

export const getServicesList = (
  context: ToolContext,
  developersApi: DevelopersApi
): Tool => ({
  name: 'get-services-list',
  title: 'Get Services List',
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
