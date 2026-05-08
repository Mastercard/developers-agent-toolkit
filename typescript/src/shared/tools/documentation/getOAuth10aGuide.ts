import { z } from 'zod';
import fetch from 'node-fetch';
import { Tool, ToolContext } from '@/shared/types';

const getDescription = (): string => {
  return `Retrieves the comprehensive OAuth 1.0a integration guide including step-by-step instructions,
code examples, and best practices for Mastercard APIs. Optionally specify a programming language
to get language-specific examples and guidance.`;
};

export const getParameters = (): z.ZodObject<any> => {
  return z.object({
    language: z
      .enum([
        'java',
        'kotlin',
        'c#',
        'python',
        'javascript',
        'typescript',
        'golang',
        'others',
      ])
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
    '/platform/documentation/authentication/using-oauth-1a-to-access-mastercard-apis/index.md';

  if (params.language) {
    let repositoryName: string | undefined;
    switch (params.language) {
      case 'java':
      case 'kotlin':
        repositoryName = 'oauth1-signer-java';
        break;
      case 'c#':
        repositoryName = 'oauth1-signer-csharp';
        break;
      case 'python':
        repositoryName = 'oauth1-signer-python';
        break;
      case 'javascript':
      case 'typescript':
        repositoryName = 'oauth1-signer-nodejs';
        break;
      case 'golang':
        repositoryName = 'oauth1-signer-golang';
        break;
    }

    if (repositoryName !== undefined) {
      const githubUrl = `https://raw.githubusercontent.com/Mastercard/${repositoryName}/refs/heads/main/README.md`;
      if (context.client.fetchGithubGuide !== undefined) {
        const content = await context.client.fetchGithubGuide(githubUrl).catch(() => undefined);
        if (content !== undefined) return content;
      } else {
        const response = await fetch(githubUrl);
        if (response.ok) return await response.text();
      }
    }
  }

  // Fallback to fetching the general OAuth 1.0a guide
  return await context.client.getDocumentationPage(basePath);
};

export const getOAuth10aGuide = (context: ToolContext): Tool => ({
  name: 'get-oauth10a-integration-guide',
  title: 'Get OAuth 1.0a Integration Guide',
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
