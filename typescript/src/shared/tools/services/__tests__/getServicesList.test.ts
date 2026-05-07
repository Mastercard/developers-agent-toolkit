import {
  execute,
  getParameters,
} from '@/shared/tools/services/getServicesList';
import { createMockApi } from '@/tests/mockDevelopersApi';

const mockApi = createMockApi();

describe('execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get list of services and return the result', async () => {
    const mockResult = 'mock services list';
    mockApi.listServices.mockResolvedValue(mockResult);

    const result = await execute({ client: mockApi }, {});

    expect(mockApi.listServices).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResult);
  });
});

describe('getParameters', () => {
  it('should return the correct parameters if no context', () => {
    const parameters = getParameters({ client: mockApi });

    const fields = Object.keys(parameters.shape);
    expect(fields).toEqual([]);
    expect(fields.length).toBe(0);
  });
});
