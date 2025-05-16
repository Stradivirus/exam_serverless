export interface Question {
  id: string;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  [key: `choice_${string}`]: string;
}