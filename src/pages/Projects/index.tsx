import { lazy } from "react";

import questions from "./project-questions.json";
import { Card } from "antd";
import ScrollToTop from "../../common/ScrollToTop";
import Container from "../../common/Container";
import { Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import Icon from "../../common/Icon";
import { Button } from "../../common/Button";
import { useTranslation } from "react-i18next";

const ContentBlock = lazy(() => import("../../components/ContentBlock"));

type Option = {
  title: string;
  text?: string;
  icon?: string;
  options?: Option[];
};

type Question = {
  title: string;
  question: string;
  options: Option[];
};

// Styled Components
const StyledPage = styled.div`
  background: #f9f9f9;
  padding: 2rem;
  margin: 2rem 0;
`;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`;

const StyledGrid = styled(Card.Grid)<{ isSelected: boolean }>`
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

const GridIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const GridTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  text-align: center;
`;

const GridText = styled.div`
  font-size: 0.9rem;
  text-align: center;
  color: #475569;
`;

const QuestionText = styled.p`
  color: #475569;
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
`;

// QuestionCard Component
type QuestionCardProps = {
  questionIndex: number;
  title: string;
  question: string;
  options?: Option[];
  selectedOptions: Record<string, boolean>;
  toggleSelection: (path: string) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  questionIndex,
  title,
  question,
  options,
  selectedOptions,
  toggleSelection,
}) => {
  const renderOptions = (options: Option[], path: number[] = []) => {
    return options.map((option, index) => {
      const currentPath = [questionIndex, ...path, index];
      const key = currentPath.join(",");

      return (
        <Fragment key={key}>
          <StyledGrid
            isSelected={!!selectedOptions[key]}
            onClick={() => !option.options && toggleSelection(key)}
            hoverable={!option.options}
          >
            {option.icon && (
              <GridIcon>{<Icon iconKey={option.icon} />}</GridIcon>
            )}
            <GridTitle>{option.title}</GridTitle>
            <GridText>{option.text}</GridText>
          </StyledGrid>
          {option.options && (
            <OptionsContainer>
              {renderOptions(option.options, [...path, index])}
            </OptionsContainer>
          )}
        </Fragment>
      );
    });
  };

  return (
    <StyledCard>
      <h6>{title}</h6>
      <QuestionText>{question}</QuestionText>
      <OptionsContainer>{renderOptions(options || [])}</OptionsContainer>
    </StyledCard>
  );
};

// Main Page Component
type QuestionsPageProps = {
  questions: Question[];
};

const QuestionsPage: React.FC<QuestionsPageProps> = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    console.log(selectedOptions);
  }, [selectedOptions]);

  const toggleSelection = (path: string) => {
    setSelectedOptions((prevState) => ({
      ...prevState,
      [path]: !prevState[path],
    }));
  };

  const handleNext = () => {
    if (currentQuestion === questions.length - 1) return;
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentQuestion === 0) return;
    setCurrentQuestion((prev) => prev - 1);
  };

  return (
    <StyledPage>
      {questions.map((q, index) => (
        <Fragment key={index}>
          {index === currentQuestion && (
            <>
              <QuestionCard
                questionIndex={index}
                title={q.title}
                question={q.question}
                options={q.options}
                selectedOptions={selectedOptions}
                toggleSelection={toggleSelection}
              />
              <ButtonWrapper>
                <Button
                  color="#fff"
                  onClick={handleBack}
                  disabled={currentQuestion === 0}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next
                </Button>
              </ButtonWrapper>
            </>
          )}
        </Fragment>
      ))}
    </StyledPage>
  );
};

const Projects = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <ScrollToTop />
      <ContentBlock
        direction="left"
        title="projectsContent.intro.title"
        content="projectsContent.intro.text"
        button={t("projectsContent.intro.button", { returnObjects: true })}
        icon="developer.svg"
        id="intro"
      />
      <QuestionsPage questions={questions} />
    </Container>
  );
};

export default Projects;
