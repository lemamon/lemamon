import styled from "styled-components";

const Container = styled.video`
  object-fit: cover;
  width: 100%;
  position: fixed;
  height: 100%;
  top: -50px;
  left: 0;
  z-index: -1;

  @media (min-width: 1024px) {
    height: auto;
    top: -300px;
    position: relative;
  }
`;

const HomeBackground = () => {
  return (
    <Container autoPlay muted loop>
      <source src="/assets/videos/home-video2.mp4" type="video/mp4" />
    </Container>
  );
};

export default HomeBackground;
