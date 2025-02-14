import { lazy } from "react";
import { useTranslation } from "react-i18next";

const Contact = lazy(() => import("../../components/Contact"));
const MiddleBlock = lazy(() => import("../../components/MiddleBlock"));
const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));
const ContentBlock = lazy(() => import("../../components/ContentBlock"));

const Home = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <ScrollToTop />
      <ContentBlock
        direction="right"
        title="introContent.title"
        content="introContent.text"
        button={t("introContent.button", { returnObjects: true })}
        icon="developer.svg"
        id="intro"
      />
      <MiddleBlock
        title="middleBlockContent.title"
        content="middleBlockContent.text"
      />
      <ContentBlock
        direction="left"
        title="aboutContent.title"
        content="aboutContent.text"
        section={t("aboutContent.section", { returnObjects: true })}
        icon="graphs.svg"
        id="about"
      />
      <ContentBlock
        direction="right"
        title="missionContent.title"
        content="missionContent.text"
        icon="product-launch.svg"
        id="mission"
      />
      <ContentBlock
        direction="left"
        title="productContent.title"
        content="productContent.text"
        icon="waving.svg"
        id="product"
      />
      <Contact
        title="contactContent.title"
        content="contactContent.text"
        id="contact"
      />
    </Container>
  );
};

export default Home;
