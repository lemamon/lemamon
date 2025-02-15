import { TFunction } from "react-i18next";

export type ButttonType = {
  title: string;
  color?: string;
  path: string;
  onClick?: () => void;
};

export type Section = {
  title: string;
  content: string;
  icon: string;
};

export interface ContentBlockProps {
  icon: string;
  title: string;
  content: string;
  section?: Section[];
  button?: ButttonType[];
  t: TFunction;
  id: string;
  direction: "left" | "right";
}
