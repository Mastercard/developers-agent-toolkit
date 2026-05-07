import { z } from 'zod';
import fetch from 'node-fetch';

import type { DevelopersApi } from '@/shared/types';

const PathSchema = z
  .string()
  .min(1, 'Path must be a non-empty string')
  .startsWith('/', 'Path must start with /');

/**
 * API client for Mastercard Developers Platform
 */
export class MastercardAPIClient {
  private readonly baseUrl = new URL('https://developer.mastercard.com/');

  /**
   * Makes HTTP request to the specified endpoint
   */
  private async request(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<string> {
    const url = new URL(endpoint, this.baseUrl);

    // Ensure the constructed URL is still within the expected domain
    if (url.hostname !== this.baseUrl.hostname) {
      throw new Error('Invalid endpoint: URL hostname mismatch');
    }

    if (params) {
      const searchParams = new URLSearchParams(params);
      url.search = searchParams.toString();
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'mastercard-developers-mcp',
      },
    });

    if (!response.ok) {
      // Don't expose detailed error information
      throw new Error(
        `Request failed with status ${response.status} - ${url.toString()}`
      );
    }

    return response.text();
  }

  /**
   * Retrieve a list of all available Mastercard services
   */
  async listServices(): Promise<string> {
    return this.request('/llms.txt', { absolute_urls: 'false' });
  }

  /**
   * Get documentation overview for a specific service
   */
  async getDocumentation(serviceId: string): Promise<string> {
    return this.request(`/${serviceId}/documentation/llms.txt`, {
      absolute_urls: 'false',
    });
  }

  /**
   * Get content for a specific documentation section
   */
  async getDocumentationSection(
    serviceId: string,
    sectionId: string
  ): Promise<string> {
    return this.request(`/${serviceId}/documentation/llms-full.txt`, {
      absolute_urls: 'false',
      section_id: sectionId,
    });
  }

  /**
   * Get a specific documentation page
   */
  async getDocumentationPage(pagePath: string): Promise<string> {
    const validatedPath = PathSchema.parse(pagePath);
    return this.request(validatedPath);
  }

  /**
   * Get API operations for a specific API specification
   */
  async getApiOperations(apiSpecificationPath: string): Promise<string> {
    const validatedPath = PathSchema.parse(apiSpecificationPath);
    return this.request(validatedPath, { summary: 'true' });
  }

  /**
   * Get detailed information for a specific API operation
   */
  async getApiOperationDetails(
    apiSpecificationPath: string,
    method: string,
    path: string
  ): Promise<string> {
    const validatedApiPath = PathSchema.parse(apiSpecificationPath);
    return this.request(validatedApiPath, { method: method, path: path });
  }
}

export const defaultDevelopersApi: DevelopersApi = new MastercardAPIClient();
