export interface VoteDeleteResponseDto {
  message: string;
  updatedOption?: {
    id: string;
    title: string;
    votes: number;
  };
}
