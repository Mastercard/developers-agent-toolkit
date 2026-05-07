import type { DevelopersApi } from '@/shared/types';

export const createMockApi = (): jest.Mocked<DevelopersApi> => ({
  listServices: jest.fn(),
  getDocumentation: jest.fn(),
  getDocumentationSection: jest.fn(),
  getDocumentationPage: jest.fn(),
  getApiOperations: jest.fn(),
  getApiOperationDetails: jest.fn(),
});
