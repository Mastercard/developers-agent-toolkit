import { fetchGithubReadme } from '@/shared/tools/documentation/githubReadme';
import { createMockApi } from '@/tests/mockDevelopersApi';
import fetch from 'node-fetch';

jest.mock('node-fetch');

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockApi = createMockApi();

describe('fetchGithubReadme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses fetchGithubGuide when provided and returns content on success', async () => {
    const fetchGithubGuide = jest.fn().mockResolvedValue('github content');

    const result = await fetchGithubReadme('oauth1-signer-java', {
      client: { ...mockApi, fetchGithubGuide },
    });

    expect(fetchGithubGuide).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/Mastercard/oauth1-signer-java/refs/heads/main/README.md'
    );
    expect(result).toBe('github content');
  });

  it('returns undefined when fetchGithubGuide is provided but fails', async () => {
    const fetchGithubGuide = jest.fn().mockRejectedValue(new Error('network error'));

    const result = await fetchGithubReadme('oauth1-signer-java', {
      client: { ...mockApi, fetchGithubGuide },
    });

    expect(result).toBeUndefined();
  });

  it('uses plain fetch when fetchGithubGuide is not provided and returns content on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('github content'),
    } as any);

    const result = await fetchGithubReadme('oauth1-signer-java', { client: mockApi });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/Mastercard/oauth1-signer-java/refs/heads/main/README.md'
    );
    expect(result).toBe('github content');
  });

  it('returns undefined when plain fetch response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false } as any);

    const result = await fetchGithubReadme('oauth1-signer-java', { client: mockApi });

    expect(result).toBeUndefined();
  });
});
