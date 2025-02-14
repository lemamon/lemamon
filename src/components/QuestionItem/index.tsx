import React, { Fragment } from "react";
import Icon from "../../common/Icon";
import {
  StyledCard,
  OptionsContainer,
  StyledGrid,
  GridIcon,
  GridTitle,
  GridText,
  QuestionText,
} from "./styles";
import type { Option, QuestionItemProps } from "./types";

const QuestionItem: React.FC<QuestionItemProps> = ({
  questionId,
  title,
  question,
  options,
  selectedOptions,
  toggleSelection,
}) => {
  const renderOptions = (opts: Option[]) =>
    opts.map((option) => {
      if (
        option.parent &&
        !Object.values(selectedOptions).some((ids) =>
          ids.includes(option.parent || "")
        )
      ) {
        return null;
      }
      return (
        <Fragment key={option.id}>
          <StyledGrid
            isSelected={!!selectedOptions[questionId]?.includes(option.id)}
            onClick={() =>
              !option.options && toggleSelection(questionId, option.id)
            }
          >
            {option.icon && (
              <GridIcon>
                <Icon iconKey={option.icon} />
              </GridIcon>
            )}
            <GridTitle>{option.title}</GridTitle>
            <GridText>{option.text}</GridText>
          </StyledGrid>
          {option.options && (
            <OptionsContainer>{renderOptions(option.options)}</OptionsContainer>
          )}
        </Fragment>
      );
    });

  return (
    <StyledCard>
      <h6>{title}</h6>
      <QuestionText>{question}</QuestionText>
      <OptionsContainer>{renderOptions(options || [])}</OptionsContainer>
    </StyledCard>
  );
};

export default QuestionItem;
