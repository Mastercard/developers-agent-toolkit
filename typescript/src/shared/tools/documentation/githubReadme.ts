import fetch from 'node-fetch';
import { ToolContext } from '@/shared/types';

export async function fetchGithubReadme(
  repositoryName: string,
  context: ToolContext
): Promise<string | undefined> {
  const url = `https://raw.githubusercontent.com/Mastercard/${repositoryName}/refs/heads/main/README.md`;
  if (context.client.fetchGithubGuide !== undefined) {
    return context.client.fetchGithubGuide(url).catch(() => undefined);
  }
  const response = await fetch(url);
  return response.ok ? response.text() : undefined;
}
