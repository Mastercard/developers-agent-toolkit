import { defaultDevelopersApi, MastercardAPIClient } from '@/shared/api';
import fetch, { RequestInfo, Response } from 'node-fetch';

const mcd = (path: string) => {
  return new URL(path, 'https://developer.mastercard.com').toString();
};

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
jest.mock('node-fetch');

describe('defaultDevelopersApi', () => {
  it('uses the default MastercardAPIClient implementation', () => {
    expect(defaultDevelopersApi).toBeInstanceOf(MastercardAPIClient);
  });
});

describe('MastercardAPIClient', () => {
  let client: MastercardAPIClient;

  afterEach(() => {
    mockFetch.mockReset();
  });

  beforeEach(() => {
    client = new MastercardAPIClient();
  });

  describe('listServices', () => {
    it('should make request to /llms.txt with absolute_urls=false', async () => {
      mockFetch.mockImplementation((url: RequestInfo) => {
        const urlString = url.toString();
        const requestUrl = new URL(urlString);
        expect(requestUrl.searchParams.get('absolute_urls')).toBe('false');
        expect(urlString).toBe(mcd('/llms.txt?absolute_urls=false'));
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('services list'),
        } as Response);
      });

      const result = await client.listServices();
      expect(result).toBe('services list');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.listServices()).rejects.toThrow();
    });

    it('should handle non-ok responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve(''),
      } as Response);

      await expect(client.listServices()).rejects.toThrow(
        'Request failed with status 404'
      );
    });
  });

  describe('getDocumentation', () => {
    it('should make request to service documentation endpoint', async () => {
      mockFetch.mockImplementation((url: RequestInfo) => {
        const urlString = url.toString();
        const requestUrl = new URL(urlString);
        expect(requestUrl.searchParams.get('absolute_urls')).toBe('false');
        expect(urlString).toBe(
          mcd('/open-finance-us/documentation/llms.txt?absolute_urls=false')
        );
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('documentation content'),
        } as Response);
      });

      const result = await client.getDocumentation('open-finance-us');
      expect(result).toBe('documentation content');
    });
  });

  describe('getDocumentationSection', () => {
    it('should make request to documentation section endpoint', async () => {
      mockFetch.mockImplementation((url: RequestInfo) => {
        const urlString = url.toString();
        const requestUrl = new URL(urlString);
        expect(requestUrl.searchParams.get('absolute_urls')).toBe('false');
        expect(requestUrl.searchParams.get('section_id')).toBe(
          'getting-started'
        );
        expect(urlString).toBe(
          mcd(
            '/open-finance-us/documentation/llms-full.txt?absolute_urls=false&section_id=getting-started'
          )
        );
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('section content'),
        } as Response);
      });

      const result = await client.getDocumentationSection(
        'open-finance-us',
        'getting-started'
      );
      expect(result).toBe('section content');
    });
  });

  describe('getDocumentationPage', () => {
    it('should make request to specific documentation page', async () => {
      mockFetch.mockImplementation((url: RequestInfo) => {
        const urlString = url.toString();
        expect(urlString).toBe(
          mcd('/open-finance-us/documentation/api-basics')
        );
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('page content'),
        } as Response);
      });

      const result = await client.getDocumentationPage(
        '/open-finance-us/documentation/api-basics'
      );
      expect(result).toBe('page content');
    });

    it('should validate path starts with /', async () => {
      await expect(client.getDocumentationPage('invalid-path')).rejects.toThrow(
        'Path must start with /'
      );
    });

    it('should validate path is non-empty', async () => {
      await expect(client.getDocumentationPage('')).rejects.toThrow(
        'Path must be a non-empty string'
      );
    });
  });

  describe('getApiOperations', () => {
    it('should make request to API specification endpoint with summary=true', async () => {
      mockFetch.mockImplementation((url: RequestInfo) => {
        const urlString = url.toString();
        const requestUrl = new URL(urlString);
        expect(requestUrl.searchParams.get('summary')).toBe('true');
        expect(urlString).toBe(
          mcd('/open-finance-us/swagger/openbanking-us.yaml?summary=true')
        );
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('operations list'),
        } as Response);
      });

      const result = await client.getApiOperations(
        '/open-finance-us/swagger/openbanking-us.yaml'
      );
      expect(result).toBe('operations list');
    });

    it('should validate API specification path', async () => {
      await expect(client.getApiOperations('invalid-path')).rejects.toThrow(
        'Path must start with /'
      );
    });
  });

  describe('getApiOperationDetails', () => {
    it('should make request with method and path parameters', async () => {
      mockFetch.mockImplementation((url: RequestInfo) => {
        const urlString = url.toString();
        const requestUrl = new URL(urlString);
        expect(requestUrl.searchParams.get('method')).toBe('GET');
        expect(requestUrl.searchParams.get('path')).toBe('/accounts');
        expect(urlString).toBe(
          mcd(
            '/open-finance-us/swagger/openbanking-us.yaml?method=GET&path=%2Faccounts'
          )
        );
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('operation details'),
        } as Response);
      });

      const result = await client.getApiOperationDetails(
        '/open-finance-us/swagger/openbanking-us.yaml',
        'GET',
        '/accounts'
      );

      expect(result).toBe('operation details');
    });

    it('should validate API specification path', async () => {
      await expect(
        client.getApiOperationDetails('invalid-path', 'GET', '/accounts')
      ).rejects.toThrow('Path must start with /');
    });
  });

  describe('request method security', () => {
    it('should reject URLs with different hostname', async () => {
      const maliciousClient = new MastercardAPIClient();

      // This should be caught by the hostname validation in the client
      await expect(
        maliciousClient.getDocumentationPage('//unknown.com/path')
      ).rejects.toThrow('Invalid endpoint: URL hostname mismatch');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.listServices()).rejects.toThrow();
    });

    it('should handle invalid URL construction', async () => {
      // Test with an invalid URL that would cause URL constructor to fail
      await expect(
        client.getDocumentationPage('http://[::1]:invalid')
      ).rejects.toThrow();
    });
  });
});
