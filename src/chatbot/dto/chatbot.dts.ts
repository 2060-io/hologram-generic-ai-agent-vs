import { ApiProperty } from '@nestjs/swagger'
import { StateStep } from 'src/core/common/enums/state-step.enum'

export class AskDto {
  @ApiProperty()
  userInput: string

  @ApiProperty()
  connectionId: string

  @ApiProperty({ required: false })
  lang?: string

  @ApiProperty({ required: false })
  isAuthenticated?: boolean

  @ApiProperty({ required: false })
  userName?: string

  @ApiProperty({ required: false, enum: StateStep })
  state?: StateStep
}
