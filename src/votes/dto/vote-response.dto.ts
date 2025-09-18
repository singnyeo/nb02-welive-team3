import { OptionResult } from "../../polls/dto/option-result.dto";

export interface VoteResponseDto {
  message: string;
  updatedOption?: OptionResult;
  winnerOption?: OptionResult;
  options?: OptionResult[];
}