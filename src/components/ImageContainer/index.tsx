import styled from "styled-components";
import banner from "./../../assets/image/banner_about.webp";

const Container = styled.figure`
  img {
    width: 370px;
    height: auto;
    @media (min-width: 1024px) {
      width: 500px;
    }
  }
  figcaption {
    font-style: italic;
    text-align: center;
  }
`;

function ImageContainer() {
  return (
    <Container className={`image-container`}>
      <img src={banner} alt="lemamon" />
      <figcaption>Deyvid Marinho</figcaption>
    </Container>
  );
}

export default ImageContainer;
