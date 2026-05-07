import { z } from 'zod';
import { Tool, ToolContext } from '@/shared/types';

const getDescription = (): string => {
  return `Retrieves the complete content of a specific documentation page.

Takes one argument:
- pagePath (str): The full path to the documentation page (e.g., '/send/documentation/use-cases/index.md')`;
};

export const getParameters = (): z.ZodObject<any> => {
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
  context: ToolContext,
  params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  return await context.client.getDocumentationPage(params.pagePath);
};

export const getDocumentationPage = (context: ToolContext): Tool => ({
  name: 'get-documentation-page',
  title: 'Get Documentation Page',
  description: getDescription(),
  parameters: getParameters(),
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  execute: (params) => execute(context, params),
});
