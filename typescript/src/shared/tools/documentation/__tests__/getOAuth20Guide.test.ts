import {
  execute,
  getParameters,
} from '@/shared/tools/documentation/getOAuth20Guide';
import { createMockApi } from '@/tests/mockDevelopersApi';
import fetch from 'node-fetch';

jest.mock('node-fetch');

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockApi = createMockApi();

describe('execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([[null], [''], ['others'], ['invalid']])(
    'should get generic OAuth 2.0 integration guide and return it when no or invalid language is specified',
    async (language) => {
      const mockResult = 'mock OAuth 2.0 guide content';
      mockApi.getDocumentationPage.mockResolvedValue(mockResult);

      const result = await execute({}, mockApi, { language: language as any });

      expect(mockApi.getDocumentationPage).toHaveBeenCalledWith(
        '/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md'
      );
      expect(result).toBe(mockResult);
    }
  );

  it.each([
    ['java', 'oauth2-client-java'],
    ['kotlin', 'oauth2-client-java'],
    ['javascript', 'oauth2-client-js'],
    ['typescript', 'oauth2-client-js'],
  ])(
    'should get OAuth 2.0 integration guide with %s language from GitHub',
    async (language, expectedRepo) => {
      const mockGithubContent = `mock OAuth 2.0 guide content with ${language} examples from GitHub`;
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockGithubContent),
      } as any);

      const result = await execute({}, mockApi, { language: language as any });

      expect(mockFetch).toHaveBeenCalledWith(
        `https://raw.githubusercontent.com/Mastercard/${expectedRepo}/refs/heads/main/README.md`
      );
      expect(result).toBe(mockGithubContent);
    }
  );

  it('should fallback to generic OAuth 2.0 guide when GitHub fetch fails', async () => {
    const mockApiResult = 'mock OAuth 2.0 guide content from API';
    mockFetch.mockResolvedValue({ ok: false } as any);
    mockApi.getDocumentationPage.mockResolvedValue(mockApiResult);

    const result = await execute({}, mockApi, { language: 'java' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/Mastercard/oauth2-client-java/refs/heads/main/README.md'
    );
    expect(mockApi.getDocumentationPage).toHaveBeenCalledWith(
      '/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md'
    );
    expect(result).toBe(mockApiResult);
  });
});

describe('getParameters', () => {
  it('should return the correct parameters', () => {
    const parameters = getParameters({});

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual(['language']);
    expect(fields.length).toBe(1);
    expect(parameters.shape.language).toBeDefined();
    expect(parameters.shape.language.isOptional()).toBe(true);
  });

  it('should not accept languages unsupported by OAuth 2.0', () => {
    const schema = getParameters({});
    expect(schema.safeParse({ language: 'c#' }).success).toBe(false);
    expect(schema.safeParse({ language: 'python' }).success).toBe(false);
    expect(schema.safeParse({ language: 'golang' }).success).toBe(false);
  });
});
