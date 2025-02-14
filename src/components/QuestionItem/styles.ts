import styled from "styled-components";
import { Card } from "antd";

export const StyledCard = styled(Card as any)`
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

export const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`;

export const StyledGrid = styled(Card.Grid)<{ isSelected: boolean }>`
  text-align: left;
  padding: 16px;
  border: 2px solid ${(props) => (props.isSelected ? "#ff0000" : "transparent")};
  background: ${(props) => (props.isSelected ? "#fad1d1" : "white")};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 200px;
`;

export const GridIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

export const GridTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  text-align: center;
`;

export const GridText = styled.div`
  font-size: 0.9rem;
  text-align: center;
  color: #475569;
`;

export const QuestionText = styled.p`
  color: #475569;
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;
