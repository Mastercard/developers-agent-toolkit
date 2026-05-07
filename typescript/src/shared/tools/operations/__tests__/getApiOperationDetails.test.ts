import {
  execute,
  getParameters,
} from '@/shared/tools/operations/getApiOperationDetails';
import { createMockApi } from '@/tests/mockDevelopersApi';

const mockApi = createMockApi();

describe('execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get API operation details and return them', async () => {
    const mockResult = 'mock operation details';
    mockApi.getApiOperationDetails.mockResolvedValue(mockResult);

    const result = await execute({}, mockApi, {
      apiSpecificationPath: '/test/path.yaml',
      method: 'GET',
      path: '/test/endpoint',
    });

    expect(mockApi.getApiOperationDetails).toHaveBeenCalledWith(
      '/test/path.yaml',
      'GET',
      '/test/endpoint'
    );
    expect(result).toBe(mockResult);
  });

  it('should use context apiSpecificationPath when provided', async () => {
    const mockResult = 'mock operation details';
    mockApi.getApiOperationDetails.mockResolvedValue(mockResult);

    const result = await execute(
      { apiSpecificationPath: '/context/path.yaml' },
      mockApi,
      {
        method: 'POST',
        path: '/context/endpoint',
      }
    );

    expect(mockApi.getApiOperationDetails).toHaveBeenCalledWith(
      '/context/path.yaml',
      'POST',
      '/context/endpoint'
    );
    expect(result).toBe(mockResult);
  });
});

describe('getParameters', () => {
  it('should return the correct parameters if no context', () => {
    const parameters = getParameters({});

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual(['apiSpecificationPath', 'method', 'path']);
    expect(fields.length).toBe(3);
  });

  it('should return the correct parameters if apiSpecificationPath is specified in context', () => {
    const parameters = getParameters({
      apiSpecificationPath: '/test/path.yaml',
    });

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual(['method', 'path']);
    expect(fields.length).toBe(2);
  });
});
