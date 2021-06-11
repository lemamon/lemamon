import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  height: 100%;
  /* min-height: 90vh;
  max-width: 1440px; */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  @media (min-width: 1024px) {
    overflow: hidden;
  }
`;

export default Container;
