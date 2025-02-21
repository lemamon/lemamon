import { lazy } from "react";
import { Fragment, useState } from "react";
import { Button } from "../../common/Button";
import { useTranslation } from "react-i18next";
import { Option } from "../../components/QuestionItem/types";
import { sendEmail } from "../../service";
import { Fade } from "react-awesome-reveal";
import { ButtonWrapper, StyledPage } from "./styles";

const QuestionItem = lazy(() => import("./../QuestionItem"));
const ContactForm = lazy(() => import("./../ContactForm"));

const ProjectBuilder: React.FC<{ questions: Option[] }> = ({ questions }) => {
  const { t } = useTranslation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [showFinalForm, setShowFinalForm] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const toggleSelection = (questionId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const list = prev[questionId] || [];
      return list.includes(optionId)
        ? { ...prev, [questionId]: list.filter((id) => id !== optionId) }
        : { ...prev, [questionId]: [...list, optionId] };
    });
  };

  const handleNext = () => {
    const currentQuestionId = questions[currentQuestion].id;
    if (
      !selectedOptions[currentQuestionId] ||
      selectedOptions[currentQuestionId].length === 0
    ) {
      return;
    }
    if (currentQuestion === questions.length - 1) {
      setShowFinalForm(true);
      return;
    }
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentQuestion === 0) return;
    setCurrentQuestion((prev) => prev - 1);
  };

  const currentQuestionNotSelected =
    !selectedOptions[questions[currentQuestion].id] ||
    selectedOptions[questions[currentQuestion].id].length === 0;

  const getTitle = (id?: string) => {
    if (!id) return "";

    return t(`projectsContent.questions.${id}.title`);
  };

  const handleSubmit = async () => {
    const optionsSummaryText = Object.entries(selectedOptions).map(
      ([questionId, optionIds]) => {
        const question = questions.find((q) => q.id === questionId);
        let options = question?.options?.filter((o) =>
          optionIds.includes(o.id)
        );

        if (!options?.length) {
          options = question?.options?.flatMap((o) =>
            (o.options || []).filter((opt) => optionIds.includes(opt.id))
          );
        }

        return `${getTitle(question?.id)}: ${options
          ?.map((o) => getTitle(o?.id))
          .join(", ")}`;
      }
    );

    const response = await sendEmail({
      email,
      phone,
      description,
      name,
      optionsSummaryText,
    });
    return response;
  };

  return (
    <StyledPage>
      {!showFinalForm ? (
        <>
          {questions.map((q, index) => (
            <Fragment key={index}>
              {index === currentQuestion && (
                <Fade triggerOnce duration={700}>
                  <QuestionItem
                    questionId={q.id}
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
                      {t("projectsContent.intro.back")}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={currentQuestionNotSelected}
                    >
                      {t("projectsContent.intro.next")}
                    </Button>
                  </ButtonWrapper>
                </Fade>
              )}
            </Fragment>
          ))}
        </>
      ) : (
        <Fade triggerOnce duration={700}>
          <ContactForm
            email={email}
            phone={phone}
            description={description}
            name={name}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPhoneChange={(e) => setPhone(e.target.value)}
            onDescriptionChange={(e) => setDescription(e.target.value)}
            onNameChange={(e) => setName(e.target.value)}
            onBack={() => {
              setShowFinalForm(false);
              setCurrentQuestion(questions.length - 1);
            }}
            onSubmit={handleSubmit}
            isValidEmail={isValidEmail(email)}
          />
        </Fade>
      )}
    </StyledPage>
  );
};

export default ProjectBuilder;
