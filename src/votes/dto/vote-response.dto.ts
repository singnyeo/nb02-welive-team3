import { OptionResult } from "../../polls/dto/option-response.dto";

export interface VoteResponseDto {
  message: string;
  updatedOption?: OptionResult;
  winnerOption?: OptionResult;
  options?: OptionResult[];
}
