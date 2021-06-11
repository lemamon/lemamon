import styled from "styled-components";
import Container from "../Container";
import ImageContainer from "../ImageContainer";
import Section from "../Section";
import TextContainer from "../TextContainer";
import useSelection from "../../hooks/useSelection";

const AboutSection = styled(Section)`
  background-color: #fe5454;
  height: 100%;
  width: 100%;
`;

const AboutContainer = styled(Container)`
  padding: 50px 0;
  flex-direction: column-reverse;
  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

function About() {
  const id = "about";
  const { setRefs } = useSelection({ threshold: 0.6, id });

  return (
    <AboutSection ref={setRefs} id={id}>
      <AboutContainer>
        <TextContainer />
        <ImageContainer />
      </AboutContainer>
    </AboutSection>
  );
}

export default About;
