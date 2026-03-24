import { z } from 'zod';
import { Tool, ToolContext } from '@/shared/types';
import api from '@/shared/api';

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
  _params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  return await api.listServices();
};

export const getServicesList = (context: ToolContext): Tool => ({
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
  execute: (params) => execute(context, params),
});
