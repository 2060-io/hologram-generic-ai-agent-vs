import { plainToInstance, Transform } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min, validateSync } from 'class-validator'

/**
 * Data Transfer Object for RAG load options.
 * Validates and transforms input options for document loading.
 */
export class RagLoadOptionsDto {
  @IsString()
  @IsNotEmpty()
  folderBasePath: string = './docs'

  @IsInt()
  @IsPositive()
  chunkSize: number = 1000

  @IsInt()
  @Min(0)
  chunkOverlap: number = 200

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.filter(Boolean) : value ? [value].filter(Boolean) : []))
  remoteUrls: string[] = []
}

/**
 * Parse and validate options into a RagLoadOptionsDto instance.
 * @param input Partial input object to be validated and transformed.
 * @returns A validated RagLoadOptionsDto with defaults applied.
 */
export function parseRagLoadOptions(input: Partial<RagLoadOptionsDto>): RagLoadOptionsDto {
  const instance = plainToInstance(RagLoadOptionsDto, input ?? {}, { enableImplicitConversion: true })
  const errors = validateSync(instance, { whitelist: true, forbidNonWhitelisted: true })
  if (errors.length) {
    const messages = errors.map((e) => ({ property: e.property, constraints: e.constraints }))
    throw new Error(`Invalid RagLoadOptions: ${JSON.stringify(messages)}`)
  }
  return instance
}
