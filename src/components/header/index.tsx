import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { HashLink as Link } from "react-router-hash-link";

interface IItem {
  isSelected: Function;
  itemName: string;
}

const items = ["home", "about", "work"];

const Item = ({ isSelected, itemName }: IItem) => {
  const path = "#" + (itemName === items[0] ? "" : itemName);

  return (
    <li className={isSelected(itemName)}>
      <Link title={itemName} to={path} aria-label={itemName}>
        Home
      </Link>
    </li>
  );
};

function Header({ isHome }: { isHome: boolean }) {
  const [selected, select] = useState(window.location.pathname);
  const history = useHistory();

  useEffect(() => {
    return history.listen((location) => {
      select(location.hash);
      console.log(location.hash);
    });
  }, [history]);

  const isSelected = (option: string) => {
    if ((selected === "" || selected === "/") && option === "home")
      return "selected";
    else return selected.includes(option) ? "selected" : "";
  };

  const toolBarTransparentStyle =
    isHome && (selected === "/" || selected === "")
      ? { backgroundColor: "transparent" }
      : {};

  return (
    <header>
      <nav>
        <ul style={toolBarTransparentStyle}>
          {items.map((i) => (
            <Item key={i} isSelected={isSelected} itemName={i} />
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
