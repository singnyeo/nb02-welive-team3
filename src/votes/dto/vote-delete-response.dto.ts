import { OptionResult } from "../../polls/dto/option-response.dto";

export interface VoteDeleteResponseDto {
  message: string;
  updatedOption?: OptionResult;
}
