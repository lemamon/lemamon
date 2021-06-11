import { FC } from "react";
import styled from "styled-components";

const Text = styled.h2`
  width: 187px;
  color: ${(props) => (props.color ? props.color : "#161616")};
  font-size: 50px;
  line-height: 1.2;
  text-align: left;
  margin: 0;
  font-weight: normal;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: left;
  width: 100%;
  max-width: 1440px;

  b {
    font-weight: 500;
  }
`;

const Title: FC<{ color?: string }> = ({ children, color }) => {
  return (
    <Container>
      <Text color={color}>{children}</Text>
    </Container>
  );
};
export default Title;
