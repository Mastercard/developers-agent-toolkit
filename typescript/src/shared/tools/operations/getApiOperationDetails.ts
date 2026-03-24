import { z } from 'zod';
import { Tool, ToolContext } from '@/shared/types';
import api from '@/shared/api';

const getDescription = (context: ToolContext): string => {
  const baseDescription = `Provides detailed information about a specific API operation including parameter definitions,
request and response schemas, and technical specifications for successful API calls.`;

  if (context.apiSpecificationPath) {
    return `${baseDescription}

Uses the configured API specification: ${context.apiSpecificationPath}

It takes two arguments:
- method (str): The HTTP method of the operation (e.g., GET, POST, PUT, DELETE)
- path (str): The API endpoint path from the specification (e.g., /payments, /accounts/{id})`;
  }

  return `${baseDescription}

It takes three arguments:
- apiSpecificationPath (str): The path to the API specification file (e.g. The path would be /open-finance-us/swagger/openbanking-us.yaml for
https://static.developer.mastercard.com/content/open-finance-us/swagger/openbanking-us.yaml,
https://developer.mastercard.com/open-finance-us/swagger/openbanking-us.yaml,
or /open-finance-us/swagger/openbanking-us.yaml)
- method (str): The HTTP method of the operation (e.g., GET, POST, PUT, DELETE)
- path (str): The API endpoint path from the specification (e.g., /payments, /accounts/{id})`;
};

export const getParameters = (context: ToolContext): z.ZodObject<any> => {
  const baseParams = {
    method: z
      .string()
      .describe(
        'The HTTP method of the operation (e.g., GET, POST, PUT, DELETE)'
      ),
    path: z
      .string()
      .describe(
        'The API endpoint path from the specification (e.g., /payments, /accounts/{id})'
      ),
  };

  if (context.apiSpecificationPath) {
    return z.object(baseParams);
  }

  return z.object({
    apiSpecificationPath: z
      .string()
      .describe(
        'The path to the API specification (e.g., /open-finance-us/swagger/openbanking-us.yaml)'
      ),
    ...baseParams,
  });
};

export const execute = async (
  context: ToolContext,
  params: z.infer<ReturnType<typeof getParameters>>
): Promise<string> => {
  if (context.apiSpecificationPath) {
    return await api.getApiOperationDetails(
      context.apiSpecificationPath,
      params.method,
      params.path
    );
  } else {
    return await api.getApiOperationDetails(
      params.apiSpecificationPath,
      params.method,
      params.path
    );
  }
};

export const getApiOperationDetails = (context: ToolContext): Tool => ({
  name: 'get-api-operation-details',
  title: 'Get API Operation Details',
  description: getDescription(context),
  parameters: getParameters(context),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: (params) => execute(context, params),
});
