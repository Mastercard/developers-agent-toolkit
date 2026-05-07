import { defaultDevelopersApi } from '@/shared/api';
import { DevelopersApi, Tool, ToolContext } from '@/shared/types';

// Documentation tools
import { getDocumentation } from '@/shared/tools/documentation/getDocumentation';
import { getDocumentationSection } from '@/shared/tools/documentation/getDocumentationSection';
import { getDocumentationPage } from '@/shared/tools/documentation/getDocumentationPage';
import { getOAuth10aGuide } from '@/shared/tools/documentation/getOAuth10aGuide';
import { getOAuth20Guide } from '@/shared/tools/documentation/getOAuth20Guide';
import { getOpenFinanceGuide } from '@/shared/tools/documentation/getOpenFinanceGuide';

// Services tools
import { getServicesList } from '@/shared/tools/services/getServicesList';

// Operations tools
import { getApiOperationList } from '@/shared/tools/operations/getApiOperationList';
import { getApiOperationDetails } from '@/shared/tools/operations/getApiOperationDetails';

export const tools = (
  context: ToolContext = {},
  developersApi: DevelopersApi = defaultDevelopersApi
): Tool[] => [
  // Services
  getServicesList(context, developersApi),

  // Documentation
  getDocumentation(context, developersApi),
  getDocumentationSection(context, developersApi),
  getDocumentationPage(context, developersApi),
  getOAuth10aGuide(context, developersApi),
  getOAuth20Guide(context, developersApi),
  getOpenFinanceGuide(context, developersApi),

  // API Operations
  getApiOperationList(context, developersApi),
  getApiOperationDetails(context, developersApi),
];
