import { z } from 'zod';
import { Tool, ToolContext } from '@/shared/types';
import api from '@/shared/api';

const getDescription = (_context: ToolContext): string => {
  return `Retrieves the complete content of a specific documentation page.

Takes one argument:
- pagePath (str): The full path to the documentation page (e.g., '/send/documentation/use-cases/index.md')`;
};

export const getParameters = (_context: ToolContext): z.ZodObject<any> => {
  return z.object({
    pagePath: z
      .string()
      .min(1)
      .describe(
        "The full path to the documentation page (e.g., '/send/documentation/use-cases/index.md')"
      ),
  });
};

export const execute = async (
  _context: ToolContext,
  params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  return await api.getDocumentationPage(params.pagePath);
};

export const getDocumentationPage = (context: ToolContext): Tool => ({
  name: 'get-documentation-page',
  title: 'Get Documentation Page',
  description: getDescription(context),
  parameters: getParameters(context),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: (params) => execute(context, params),
});
