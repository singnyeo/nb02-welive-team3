import { OptionResult } from "../../polls/dto/option-result.dto";

export interface VoteResponseDto {
  message: string;
  updatedOption: {
    id: string;
    title: string;
    votes: number;
  };
  winnerOption?: {
    id: string;
    title: string;
    votes: number;
  };
  options: Array<{
    id: string;
    title: string;
    votes: number;
  }>;
}
