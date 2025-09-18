import { OptionResult } from "../../polls/dto/option-result.dto";

export interface VoteDeleteResponseDto {
  message: string;
  updatedOption: {
    id: string;
    title: string;
    votes: number;
  };
}
