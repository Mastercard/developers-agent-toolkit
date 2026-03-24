import { MastercardDevelopersAgentToolkit, buildContext } from '../';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { tools } from '@/shared/tools';

describe('MastercardDevelopersAgentToolkit', () => {
  function expectDefined<T>(value: T | undefined, message: string): T {
    if (value === undefined) {
      throw new Error(message);
    }

    return value;
  }

  async function listRegisteredTools(
    config: ConstructorParameters<typeof MastercardDevelopersAgentToolkit>[0]
  ) {
    const server = new MastercardDevelopersAgentToolkit(config);
    const client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    try {
      const result = await client.listTools();
      return result.tools;
    } finally {
      await Promise.all([client.close(), server.close()]);
    }
  }

  it('should list all tools with correct name/description when no config', async () => {
    const registeredTools = await listRegisteredTools({});
    const expectedTools = tools({});
    expect(registeredTools).toHaveLength(expectedTools.length);

    expectedTools.forEach((expectedTool, index) => {
      const registeredTool = expectDefined(
        registeredTools[index],
        `Missing registered tool at index ${index}`
      );
      expect(registeredTool.name).toBe(expectedTool.name);
      expect(registeredTool.title).toBe(expectedTool.title);
      expect(registeredTool.description).toBe(expectedTool.description);
      expect(registeredTool.annotations).toEqual(expectedTool.annotations);
      expect(registeredTool.inputSchema).toBeDefined();
    });
  });

  it('should list context-aware tools when apiSpecificationPath configured', async () => {
    const registeredTools = await listRegisteredTools({
      apiSpecification:
        'https://static.developer.mastercard.com/content/service/swagger/path.yaml',
    });

    const expectedTools = tools({
      serviceId: 'service',
      apiSpecificationPath: '/service/swagger/path.yaml',
    }).filter((tool) => tool.name !== 'get-services-list');
    expect(registeredTools).toHaveLength(expectedTools.length);

    expectedTools.forEach((expectedTool, index) => {
      const registeredTool = expectDefined(
        registeredTools[index],
        `Missing registered tool at index ${index}`
      );
      expect(registeredTool.name).toBe(expectedTool.name);
      expect(registeredTool.title).toBe(expectedTool.title);
      expect(registeredTool.description).toBe(expectedTool.description);
      expect(registeredTool.annotations).toEqual(expectedTool.annotations);
      expect(registeredTool.inputSchema).toBeDefined();
    });
  });

  it('should exclude get-services-list when serviceId configured', async () => {
    const registeredTools = await listRegisteredTools({
      service: 'https://developer.mastercard.com/test-service/documentation/',
    });

    const expectedTools = tools({ serviceId: 'test-service' }).filter(
      (tool) => tool.name !== 'get-services-list'
    );
    const registeredNames = registeredTools.map((tool) => tool.name);

    expect(registeredNames).not.toContain('get-services-list');
    expect(registeredTools).toHaveLength(expectedTools.length);

    expectedTools.forEach((expectedTool, index) => {
      const registeredTool = expectDefined(
        registeredTools[index],
        `Missing registered tool at index ${index}`
      );
      expect(registeredTool.name).toBe(expectedTool.name);
      expect(registeredTool.title).toBe(expectedTool.title);
      expect(registeredTool.description).toBe(expectedTool.description);
      expect(registeredTool.annotations).toEqual(expectedTool.annotations);
      expect(registeredTool.inputSchema).toBeDefined();
    });
  });
});

describe('buildContext function', () => {
  describe('success cases', () => {
    it('should return empty context when no config provided', () => {
      const result = buildContext({});
      expect(result).toEqual({});
    });

    it('should parse service URL and extract serviceId', () => {
      const result = buildContext({
        service:
          'https://developer.mastercard.com/open-finance-us/documentation/',
      });
      expect(result).toEqual({
        serviceId: 'open-finance-us',
      });
    });

    it('should parse API specification URL and extract serviceId and apiSpecificationPath', () => {
      const result = buildContext({
        apiSpecification:
          'https://static.developer.mastercard.com/content/test-service/swagger/api.yaml',
      });
      expect(result).toEqual({
        serviceId: 'test-service',
        apiSpecificationPath: '/test-service/swagger/api.yaml',
      });
    });

    it('should handle nested API specification paths', () => {
      const result = buildContext({
        apiSpecification:
          'https://static.developer.mastercard.com/content/payment-gateway/swagger/nested/spec.yaml',
      });
      expect(result).toEqual({
        serviceId: 'payment-gateway',
        apiSpecificationPath: '/payment-gateway/swagger/nested/spec.yaml',
      });
    });

    it('should handle service IDs with hyphens and numbers', () => {
      const result = buildContext({
        service:
          'https://developer.mastercard.com/open-finance-us-v2/documentation/',
      });
      expect(result).toEqual({
        serviceId: 'open-finance-us-v2',
      });
    });
  });

  describe('error cases', () => {
    it('should throw error for invalid service URL format', () => {
      expect(() => {
        buildContext({
          service: 'https://invalid-domain.com/service/documentation/',
        });
      }).toThrow('Invalid service URL provided');
    });

    it('should throw error for service URL without documentation path', () => {
      expect(() => {
        buildContext({ service: 'https://developer.mastercard.com/service/' });
      }).toThrow('Invalid service URL provided');
    });

    it('should throw error for invalid API specification URL format', () => {
      expect(() => {
        buildContext({
          apiSpecification:
            'https://invalid-domain.com/content/service/swagger/api.yaml',
        });
      }).toThrow('Invalid API specification path provided');
    });

    it('should throw error for API specification without proper path structure', () => {
      expect(() => {
        buildContext({
          apiSpecification:
            'https://static.developer.mastercard.com/invalid/path.yaml',
        });
      }).toThrow('Invalid API specification path provided');
    });

    it('should throw error for API specification without .yaml extension', () => {
      expect(() => {
        buildContext({
          apiSpecification:
            'https://static.developer.mastercard.com/content/service/swagger/api.json',
        });
      }).toThrow('Invalid API specification path provided');
    });

    it('should throw error for invalid service ID format (contains invalid characters)', () => {
      expect(() => {
        buildContext({
          service:
            'https://developer.mastercard.com/service_with_underscore/documentation/',
        });
      }).toThrow('Invalid service URL provided');
    });
  });
});
