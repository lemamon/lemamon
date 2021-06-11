import { FC } from "react";
import styled from "styled-components";
import { useSelect } from "../../context";
import { headerItems } from "../../data";

const Container = styled.header`
  z-index: 1;
  & > nav > ul {
    position: fixed;
    align-items: center;
    width: 100%;
    height: 65px;
    background: #fff;
    margin: 0;
    top: 0;
    z-index: 1;
  }

  .selected::before {
    content: "";
    width: 36px;
    height: 2px;
    position: absolute;
    bottom: 5px;
    background: #707070;
  }
`;

interface IItem {
  isSelected: Function;
  itemName: string;
}

const Item: FC<IItem> = ({ isSelected, itemName }) => {
  const path = "#" + (itemName === headerItems[0] ? "" : itemName);

  return (
    <li className={isSelected(itemName)}>
      <a href={path} aria-label={itemName}>
        {itemName}
      </a>
      {/* <Link title={itemName} to={path} aria-label={itemName}>
        Home
      </Link> */}
    </li>
  );
};

function Header() {
  const {
    state: { selected },
  } = useSelect();

  const isSelected = (option: string) => {
    if ((selected === "" || selected === "/") && option === "home")
      return "selected";
    else return selected.includes(option) ? "selected" : "";
  };

  return (
    <Container>
      <nav className="navbar">
        <ul>
          {headerItems.map((i) => (
            <Item key={i} isSelected={isSelected} itemName={i} />
          ))}
        </ul>
      </nav>
    </Container>
  );
}

export default Header;
