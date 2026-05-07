import { Tool, ToolContext } from '@/shared/types';

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

export const tools = (context: ToolContext): Tool[] => [
  // Services
  getServicesList(context),

  // Documentation
  getDocumentation(context),
  getDocumentationSection(context),
  getDocumentationPage(context),
  getOAuth10aGuide(context),
  getOAuth20Guide(context),
  getOpenFinanceGuide(context),

  // API Operations
  getApiOperationList(context),
  getApiOperationDetails(context),
];
