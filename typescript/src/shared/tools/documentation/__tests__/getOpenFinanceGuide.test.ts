import {
  execute,
  getParameters,
} from '@/shared/tools/documentation/getOpenFinanceGuide';
import { createMockApi } from '@/tests/mockDevelopersApi';

const mockApi = createMockApi();

describe('execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get Open Finance integration guide and return it', async () => {
    const mockResult = 'mock Open Finance guide content';
    mockApi.getDocumentationPage.mockResolvedValue(mockResult);

    const result = await execute({}, mockApi, {});

    expect(mockApi.getDocumentationPage).toHaveBeenCalledWith(
      '/open-finance-us/documentation/quick-start-guide/index.md'
    );
    expect(result).toBe(mockResult);
  });
});

describe('getParameters', () => {
  it('should return the correct parameters if no context', () => {
    const parameters = getParameters({});

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual([]);
    expect(fields.length).toBe(0);
  });
});
