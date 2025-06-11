import { DynamicStructuredTool } from 'langchain/tools'
import { z } from 'zod'
import { Logger } from '@nestjs/common'

const logger = new Logger('statisticsFetcherTool')

export const statisticsFetcherTool = new DynamicStructuredTool({
  name: 'statistics_fetcher',
  description:
    'Use this tool to fetch statistics USER_CONNECTED by sending a POST request with time range, stat class, and granularity',
  schema: z.object({
    from: z.string().describe('Start date in ISO format (e.g., 2025-06-01T00:00:00Z)'),
    to: z.string().describe('End date in ISO format (e.g., 2025-06-10T23:59:59Z)'),
    statClass: z.string().describe('Statistic class, e.g., USER_CONNECTED'),
    statGranularity: z.enum(['HOUR', 'DAY', 'MONTH']),
    statResultType: z.enum(['LIST_AND_SUM']),
    statEnums: z
      .array(
        z.object({
          index: z.number(),
          label: z.string(),
          value: z.string(),
          description: z.string(),
        }),
      )
      .describe('List of enum filters for the query'),
  }),
  async func({ from, to, statClass, statGranularity, statResultType, statEnums }, _runManager, config) {
    const url = process.env.STATISTICS_API_URL

    if (!url) {
      logger.error('❌ STATISTICS_API_URL is not defined.')
      return 'Statistics API URL is not configured in the environment.'
    }

    const isAuthenticated: boolean = config?.configurable?.isAuthenticated ?? false
    logger.debug(`[Tool] config: ${JSON.stringify(config)}`)
    logger.debug(`[Tool] isAuthenticated: ${isAuthenticated}`)

    if (process.env.STATISTICS_REQUIRE_AUTH === 'true' && !isAuthenticated) {
      logger.debug(`[Tool: statistics_fetcher] Attempted statistics access without authentication.`)
      return 'Authentication is required to access this feature. Please log in and try again.'
    }

    logger.debug('Invoked with parameters:')
    logger.debug(JSON.stringify({ from, to, statClass, statGranularity, statResultType, statEnums }, null, 2))

    const effectiveEnums =
      statEnums.length > 0
        ? statEnums
        : [
            {
              index: 0,
              label: 'default',
              value: 'default',
              description: 'default fallback value',
            },
          ]

    if (statEnums.length === 0) {
      logger.warn('[Tool:statisticsFetcher] No statEnums provided – using default fallback enum.')
    }

    const payload = {
      from,
      to,
      statClass,
      statResultType,
      statEnums: effectiveEnums,
    }

    try {
      logger.log(`🔄 Sending POST request to: ${url}`)
      logger.debug(`📦 Payload: ${JSON.stringify(payload, null, 2)}`)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      logger.log(`📥 HTTP status: ${response.status}`)

      if (!response.ok) {
        const err = await response.text()
        logger.error(`❌ API Error: ${err}`)
        throw new Error(`API returned ${response.status}: ${err}`)
      }

      const result = await response.json()
      logger.debug(`✅ API Response: ${JSON.stringify(result, null, 2)}`)

      return JSON.stringify(result, null, 2)
    } catch (error) {
      logger.error('❌ Exception occurred:', error instanceof Error ? error.stack : String(error))
      return `Failed to fetch statistics: ${(error as Error).message}`
    }
  },
})
