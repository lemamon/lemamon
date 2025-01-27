import { StyledButton } from "./styles";
import { ButtonProps } from "../types";

export const Button = ({ color, children, onClick, disabled }: ButtonProps) => (
  <StyledButton color={color} onClick={onClick} disabled={disabled}>
    {children}
  </StyledButton>
);
