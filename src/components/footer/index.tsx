import { FC } from "react";
import styled from "styled-components";
import { footerItems } from "../../data";

const Contianer = styled.footer`
  position: fixed;
  bottom: 0;
  min-width: 100vw;
  background-color: #fff;
  @media (min-width: 1024px) {
    nav > ul {
      justify-content: flex-end;
    }
  }
`;

const List = styled.ul`
  margin: 10px 0px 25px;
`;

interface ItemProps {
  name: string;
  link: string;
}

const Item: FC<ItemProps> = ({ name, link }) => {
  return (
    <li>
      <a href={link}>{name}</a>
    </li>
  );
};

const Footer = () => {
  return (
    <Contianer>
      <nav>
        <List>
          {footerItems.map((item) => (
            <Item key={item.name} {...item} />
          ))}
        </List>
      </nav>
    </Contianer>
  );
};

export default Footer;
