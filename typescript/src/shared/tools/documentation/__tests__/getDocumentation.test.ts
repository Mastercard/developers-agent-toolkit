import {
  execute,
  getParameters,
} from '@/shared/tools/documentation/getDocumentation';
import { createMockApi } from '@/tests/mockDevelopersApi';

const mockApi = createMockApi();

describe('execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get documentation for a service and return it', async () => {
    const mockResult = 'mock documentation';
    mockApi.getDocumentation.mockResolvedValue(mockResult);

    const result = await execute(
      { client: mockApi },
      { serviceId: 'test-service' }
    );

    expect(mockApi.getDocumentation).toHaveBeenCalledWith('test-service');
    expect(result).toBe(mockResult);
  });

  it('should use context serviceId when provided', async () => {
    const mockResult = 'mock documentation';
    mockApi.getDocumentation.mockResolvedValue(mockResult);

    const result = await execute(
      { client: mockApi, serviceId: 'context-service' },
      {}
    );

    expect(mockApi.getDocumentation).toHaveBeenCalledWith('context-service');
    expect(result).toBe(mockResult);
  });
});

describe('getParameters', () => {
  it('should return the correct parameters if no context', () => {
    const parameters = getParameters({ client: mockApi });

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual(['serviceId']);
    expect(fields.length).toBe(1);
  });

  it('should return the correct parameters if serviceId is specified in context', () => {
    const parameters = getParameters({
      client: mockApi,
      serviceId: 'test-service',
    });

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual([]);
    expect(fields.length).toBe(0);
  });
});
