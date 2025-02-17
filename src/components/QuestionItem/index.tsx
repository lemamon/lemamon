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
import { useTranslation } from "react-i18next";

const QuestionItem: React.FC<QuestionItemProps> = ({
  questionId,
  options,
  selectedOptions,
  toggleSelection,
}) => {
  const { t } = useTranslation();
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
            <GridTitle>
              {t(`projectsContent.questions.${option.id}.title`)}
            </GridTitle>
            <GridText>
              {t(`projectsContent.questions.${option.id}.text`, {
                defaultValue: "",
              })}
            </GridText>
          </StyledGrid>
          {option.options && (
            <OptionsContainer>{renderOptions(option.options)}</OptionsContainer>
          )}
        </Fragment>
      );
    });

  return (
    <StyledCard>
      <h6>{t(`projectsContent.questions.${questionId}.title`)}</h6>
      <QuestionText>
        {t(`projectsContent.questions.${questionId}.question`)}
      </QuestionText>
      <OptionsContainer>{renderOptions(options || [])}</OptionsContainer>
    </StyledCard>
  );
};

export default QuestionItem;
