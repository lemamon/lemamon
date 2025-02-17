import { lazy } from "react";
import questions from "./data.json";
import ScrollToTop from "../../common/ScrollToTop";
import Container from "../../common/Container";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ContentBlock = lazy(() => import("../../components/ContentBlock"));
const ProjectBuilder = lazy(() => import("../../components/ProjectBuilder"));

const Projects = () => {
  const { t } = useTranslation();
  const [isInitial, setIsInitial] = useState(true);

  return (
    <Container>
      <ScrollToTop />
      {isInitial ? (
        <ContentBlock
          direction="right"
          title="projectsContent.intro.title"
          content={[
            "projectsContent.intro.text",
            "projectsContent.intro.instructions",
          ]}
          button={[
            {
              ...t("projectsContent.intro.button", { returnObjects: true }),
              onClick: () => setIsInitial(false),
            },
          ]}
          icon="product-launch.svg"
          id="intro"
        />
      ) : (
        <ProjectBuilder questions={questions} />
      )}
    </Container>
  );
};

export default Projects;
