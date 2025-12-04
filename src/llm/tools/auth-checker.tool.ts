import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { Logger } from '@nestjs/common'

const toolCtor = DynamicStructuredTool as unknown as new (fields: any) => DynamicStructuredTool
const logger = new Logger('authChecker')

const authCheckSchema: z.ZodTypeAny = z
  .object({
    reason: z.string().optional().describe('Short reason for checking authentication'),
  })
  .strict() as z.ZodTypeAny

export const authCheckerTool = new toolCtor({
  name: 'auth_checker',
  description: 'Check if the current session is authenticated. Use before calling tools that require auth.',
  schema: authCheckSchema,
  async func(_input, _runManager, config) {
    const isAuthenticated: boolean = config?.configurable?.isAuthenticated ?? false
    logger.log(`[auth_checker] invoked - isAuthenticated=${isAuthenticated}`)
    return isAuthenticated
      ? 'User is authenticated.'
      : 'User is NOT authenticated. Please authenticate before proceeding.'
  },
  returnDirect: false,
}) as DynamicStructuredTool
