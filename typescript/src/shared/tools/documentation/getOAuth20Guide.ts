import { z } from 'zod';
import fetch from 'node-fetch';
import { Tool, ToolContext } from '@/shared/types';

const getDescription = (): string => {
  return `Retrieves the comprehensive OAuth 2.0 integration guide including step-by-step instructions,
code examples, and best practices for Mastercard APIs. Optionally specify a programming language
to get language-specific examples and guidance.`;
};

export const getParameters = (): z.ZodObject<any> => {
  return z.object({
    language: z
      .enum(['java', 'kotlin', 'javascript', 'typescript', 'others'])
      .optional()
      .describe(
        'Programming language for language-specific examples and guidance'
      ),
  });
};

export const execute = async (
  context: ToolContext,
  params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  const basePath =
    '/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md';

  if (params.language) {
    let repositoryName: string | undefined;
    switch (params.language) {
      case 'java':
      case 'kotlin':
        repositoryName = 'oauth2-client-java';
        break;
      case 'javascript':
      case 'typescript':
        repositoryName = 'oauth2-client-js';
        break;
    }

    if (repositoryName !== undefined) {
      const githubUrl = `https://raw.githubusercontent.com/Mastercard/${repositoryName}/refs/heads/main/README.md`;
      if (context.client.fetchGithubGuide !== undefined) {
        const content = await context.client
          .fetchGithubGuide(githubUrl)
          .catch(() => undefined);
        if (content !== undefined) return content;
      } else {
        const response = await fetch(githubUrl);
        if (response.ok) return await response.text();
      }
    }
  }

  // Fallback to fetching the general OAuth 2.0 guide
  return await context.client.getDocumentationPage(basePath);
};

export const getOAuth20Guide = (context: ToolContext): Tool => ({
  name: 'get-oauth20-integration-guide',
  title: 'Get OAuth 2.0 Integration Guide',
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
