export type Option = {
  id: string;
  parent?: string;
  icon?: string;
  options?: Option[];
};

export type QuestionItemProps = {
  questionId: string;
  options?: Option[];
  selectedOptions: Record<string, string[]>;
  toggleSelection: (questionId: string, optionId: string) => void;
};
