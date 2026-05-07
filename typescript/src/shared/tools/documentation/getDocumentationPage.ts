import { z } from 'zod';
import { DevelopersApi, Tool, ToolContext } from '@/shared/types';

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
      .startsWith('/')
      .describe(
        "The full path to the documentation page (e.g., '/send/documentation/use-cases/index.md')"
      ),
  });
};

export const execute = async (
  _context: ToolContext,
  developersApi: DevelopersApi,
  params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  return await developersApi.getDocumentationPage(params.pagePath);
};

export const getDocumentationPage = (
  context: ToolContext,
  developersApi: DevelopersApi
): Tool => ({
  name: 'get-documentation-page',
  title: 'Get Documentation Page',
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
