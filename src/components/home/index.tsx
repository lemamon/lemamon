import styled from "styled-components";
import useSelection from "../../hooks/useSelection";
import Container from "../Container";
import HomeBackground from "../HomeBackground";
import Section from "../Section";
import Subtitle from "../Subtitle";
import Title from "../Title";

const HomeSection = styled(Section)<{ ref: any }>`
  padding: 20px 60px 10px;
  height: 50%;
  max-height: 90vh;
  min-height: 90vh;
  justify-content: flex-start;
`;

const HomeContainer = styled(Container)`
  justify-content: flex-start;
  align-items: flex-start;
`;

function Home() {
  const id = "";
  const { setRefs } = useSelection({ threshold: 0.7, id });

  return (
    <HomeSection ref={setRefs}>
      <HomeContainer>
        <Title>
          Deyvid <br /> <b>Marinho</b>
        </Title>
        <Subtitle>Software Engineer 👨🏻‍💻</Subtitle>
        <HomeBackground />
      </HomeContainer>
    </HomeSection>
  );
}

export default Home;
