import {
  execute,
  getParameters,
} from '@/shared/tools/operations/getApiOperationList';
import { createMockApi } from '@/tests/mockDevelopersApi';

const mockApi = createMockApi();

describe('execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get API operations list and return them', async () => {
    const mockResult = 'mock operations list';
    mockApi.getApiOperations.mockResolvedValue(mockResult);

    const result = await execute({}, mockApi, {
      apiSpecificationPath: '/test/path.yaml',
    });

    expect(mockApi.getApiOperations).toHaveBeenCalledWith('/test/path.yaml');
    expect(result).toBe(mockResult);
  });

  it('should use context apiSpecificationPath when provided', async () => {
    const mockResult = 'mock operations list';
    mockApi.getApiOperations.mockResolvedValue(mockResult);

    const result = await execute(
      { apiSpecificationPath: '/context/path.yaml' },
      mockApi,
      {}
    );

    expect(mockApi.getApiOperations).toHaveBeenCalledWith('/context/path.yaml');
    expect(result).toBe(mockResult);
  });
});

describe('getParameters', () => {
  it('should return the correct parameters if no context', () => {
    const parameters = getParameters({});

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual(['apiSpecificationPath']);
    expect(fields.length).toBe(1);
  });

  it('should return the correct parameters if apiSpecificationPath is specified in context', () => {
    const parameters = getParameters({
      apiSpecificationPath: '/test/path.yaml',
    });

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual([]);
    expect(fields.length).toBe(0);
  });
});
