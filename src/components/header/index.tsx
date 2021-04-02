import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

interface IItem {
  isSelected: Function;
  itemName: string;
}

const items = ["home", "about", "work"];

const Item = ({ isSelected, itemName }: IItem) => {
  const path = "/" + (itemName === items[0] ? "" : itemName);

  return (
    <li className={isSelected(itemName)}>
      <Link title={itemName} to={path} aria-label={itemName}>
        Home
      </Link>
    </li>
  );
};

function Header() {
  const [selected, select] = useState(window.location.pathname);
  const history = useHistory();

  useEffect(() => {
    return history.listen((location) => {
      select(location.pathname);
    });
  }, [history]);

  const isSelected = (option: string) => {
    if (selected === "/" && option === "home") return "selected";
    else return selected.includes(option) ? "selected" : "";
  };

  return (
    <header>
      <nav>
        <ul style={selected === "/" ? { backgroundColor: "transparent" } : {}}>
          {items.map((i) => (
            <Item isSelected={isSelected} itemName={i} />
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
