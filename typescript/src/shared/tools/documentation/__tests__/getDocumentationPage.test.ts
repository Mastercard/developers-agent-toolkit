import {
  execute,
  getParameters,
} from '@/shared/tools/documentation/getDocumentationPage';
import { createMockApi } from '@/tests/mockDevelopersApi';

const mockApi = createMockApi();

describe('execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get documentation page and return it', async () => {
    const mockResult = 'mock documentation page content';
    mockApi.getDocumentationPage.mockResolvedValue(mockResult);

    const result = await execute(
      { client: mockApi },
      { pagePath: '/test/page.md' }
    );

    expect(mockApi.getDocumentationPage).toHaveBeenCalledWith('/test/page.md');
    expect(result).toBe(mockResult);
  });
});

describe('getParameters', () => {
  it('should return the correct parameters if no context', () => {
    const parameters = getParameters({ client: mockApi });

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual(['pagePath']);
    expect(fields.length).toBe(1);
  });
});
