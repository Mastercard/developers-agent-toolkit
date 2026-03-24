import { z } from 'zod';
import { Tool, ToolContext } from '@/shared/types';
import api from '@/shared/api';

const getDescription = (context: ToolContext): string => {
  const baseDescription = `
Retrieves the complete content for a specific documentation section. 
IMPORTANT: A section is not a single page, but rather a collection of pages that are grouped together.
`;

  if (context.serviceId) {
    return `${baseDescription}

Uses the configured service: ${context.serviceId}

It takes one argument:
- sectionId (str): The specific section identifier within the service documentation (e.g., 'getting-started', 'api-reference')`;
  }

  return `${baseDescription}

It takes two arguments:
- serviceId (str): The unique identifier of the Mastercard service (e.g., 'send', 'loyalty', 'locations')
- sectionId (str): The specific section identifier within the service documentation (e.g., 'getting-started', 'api-reference')
`;
};

export const getParameters = (context: ToolContext): z.ZodObject<any> => {
  const baseParams = {
    sectionId: z
      .string()
      .min(1)
      .describe(
        "The specific section identifier within the service documentation (e.g., 'getting-started', 'api-reference')"
      ),
  };

  if (context.serviceId) {
    return z.object(baseParams);
  }

  return z.object({
    serviceId: z
      .string()
      .min(1)
      .describe(
        "The unique identifier of the Mastercard service (e.g., 'send', 'loyalty', 'locations')"
      ),
    ...baseParams,
  });
};

export const execute = async (
  context: ToolContext,
  params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  const serviceId = context.serviceId || params.serviceId;
  return await api.getDocumentationSection(serviceId, params.sectionId);
};

export const getDocumentationSection = (context: ToolContext): Tool => ({
  name: 'get-documentation-section-content',
  title: 'Get Documentation Section Content',
  description: getDescription(context),
  parameters: getParameters(context),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: (params) => execute(context, params),
});
