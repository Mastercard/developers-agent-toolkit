import { z } from 'zod';
import { Tool, ToolContext } from '@/shared/types';
import api from '@/shared/api';

const getDescription = (context: ToolContext): string => {
  const baseDescription = `Provides an overview of all available documentation for a specific Mastercard service
including section titles, descriptions, and navigation links.`;

  if (context.serviceId) {
    return `${baseDescription}

Uses the configured service: ${context.serviceId}`;
  }

  return `${baseDescription}

It takes one argument:
- serviceId (str): The unique identifier of the Mastercard service (e.g., 'send', 'loyalty', 'locations')`;
};

export const getParameters = (context: ToolContext): z.ZodObject<any> => {
  if (context.serviceId) {
    return z.object({});
  }

  return z.object({
    serviceId: z
      .string()
      .min(1)
      .describe(
        "The unique identifier of the Mastercard service (e.g., 'send', 'loyalty', 'locations')"
      ),
  });
};

export const execute = async (
  context: ToolContext,
  params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  const serviceId = context.serviceId || params.serviceId;
  return await api.getDocumentation(serviceId);
};

export const getDocumentation = (context: ToolContext): Tool => ({
  name: 'get-documentation',
  title: 'Get Documentation',
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
