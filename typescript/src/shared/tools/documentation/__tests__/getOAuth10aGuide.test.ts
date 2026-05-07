import {
  execute,
  getParameters,
} from '@/shared/tools/documentation/getOAuth10aGuide';
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
    'should get generic OAuth 1.0a integration guide and return it when no or invalid language is specified',
    async (language) => {
      const mockResult = 'mock OAuth 1.0a guide content';
      mockApi.getDocumentationPage.mockResolvedValue(mockResult);

      const result = await execute(
        { client: mockApi },
        { language: language as any }
      );

      expect(mockApi.getDocumentationPage).toHaveBeenCalledWith(
        '/platform/documentation/authentication/using-oauth-1a-to-access-mastercard-apis/index.md'
      );
      expect(result).toBe(mockResult);
    }
  );

  it.each([
    ['java', 'oauth1-signer-java'],
    ['kotlin', 'oauth1-signer-java'],
    ['c#', 'oauth1-signer-csharp'],
    ['python', 'oauth1-signer-python'],
    ['javascript', 'oauth1-signer-nodejs'],
    ['typescript', 'oauth1-signer-nodejs'],
    ['golang', 'oauth1-signer-golang'],
  ])(
    'should get OAuth 1.0a integration guide with %s language from GitHub',
    async (language, expectedRepo) => {
      const mockGithubContent = `mock OAuth 1.0a guide content with ${language} examples from GitHub`;
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockGithubContent),
      } as any);

      const result = await execute(
        { client: mockApi },
        { language: language as any }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `https://raw.githubusercontent.com/Mastercard/${expectedRepo}/refs/heads/main/README.md`
      );
      expect(result).toBe(mockGithubContent);
    }
  );

  it('should fallback to generic oauth1.0a guide when GitHub fetch fails', async () => {
    const mockApiResult = 'mock OAuth 1.0a guide content from API';
    mockFetch.mockResolvedValue({
      ok: false,
    } as any);
    mockApi.getDocumentationPage.mockResolvedValue(mockApiResult);

    const result = await execute({ client: mockApi }, { language: 'java' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/Mastercard/oauth1-signer-java/refs/heads/main/README.md'
    );
    expect(mockApi.getDocumentationPage).toHaveBeenCalledWith(
      '/platform/documentation/authentication/using-oauth-1a-to-access-mastercard-apis/index.md'
    );
    expect(result).toBe(mockApiResult);
  });
});

describe('getParameters', () => {
  it('should return the correct parameters if no context', () => {
    const parameters = getParameters({ client: mockApi });

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual(['language']);
    expect(fields.length).toBe(1);
    expect(parameters.shape.language).toBeDefined();
    expect(parameters.shape.language.isOptional()).toBe(true);
  });
});
