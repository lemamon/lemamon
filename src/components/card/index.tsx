import styled from "styled-components";

const Item = styled.div`
  width: 310px;
  min-height: 278px;
  margin: 20px 20px;
  padding: 10px 20px;
  overflow: hidden;
  border-radius: 10px;
  transition: 0.2s;

  @media (min-width: 1024px) {
    height: 278px;
    &:hover {
      transform: scale(1.5);
      overflow: inherit;
      height: auto;
    }
  }

  h3 {
    font-size: 18px;
    line-height: 1.57;
    text-align: left;
    color: #000000;
  }

  h5 {
    font-size: 12px;
    line-height: 1.42;
    text-align: left;
    color: #707070;
  }

  p {
    font-size: 11px;
    line-height: 2;
    letter-spacing: normal;
    text-align: left;
    color: #707070;
  }
`;

interface IProject {
  title: string;
  description: string;
  client: string;
  company: string;
  jobTitle: string;
  date: string;
  background: string;
  images: string[];
}

function Card({
  title,
  description,
  jobTitle,
  company,
  client,
  background,
}: IProject) {
  return (
    <Item style={{ backgroundColor: background }}>
      <h3> {title}</h3>
      <h5>
        {jobTitle} - {company} - {client}
      </h5>
      <p>{description}</p>
    </Item>
  );
}

export default Card;
