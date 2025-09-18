import { OptionResult } from "../../polls/dto/option-result.dto";

export interface VoteDeleteResponseDto {
  message: string;
  updatedOption?: OptionResult;
}