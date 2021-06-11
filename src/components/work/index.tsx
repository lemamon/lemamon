import styled from "styled-components";
import { projects } from "../../data/projects.json";
import useSelection from "../../hooks/useSelection";
import { shuffle } from "../../utils";
import Card from "../Card";
import Container from "../Container";
import Section from "../Section";
import Title from "../Title";

const WorkSection = styled(Section)<{ ref: any }>`
  padding: 20px 60px 10px;
`;

const List = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  height: 100%;
  padding-top: 50px;
`;

function Work() {
  const id = "work";
  const { setRefs } = useSelection({ threshold: 0.1, id });

  return (
    <WorkSection id={id} ref={setRefs}>
      <Container>
        <Title> Work 💼</Title>
        <List>
          {shuffle(projects).map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </List>
      </Container>
    </WorkSection>
  );
}

export default Work;
