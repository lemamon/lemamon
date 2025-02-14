export type Option = {
  id: string;
  parent?: string;
  title: string;
  text?: string;
  icon?: string;
  question?: string;
  options?: Option[];
};

export type QuestionItemProps = {
  questionIndex: number;
  questionId: string;
  title: string;
  question?: string;
  options?: Option[];
  selectedOptions: Record<string, string[]>;
  toggleSelection: (questionId: string, optionId: string) => void;
};
