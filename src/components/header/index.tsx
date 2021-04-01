import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

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
          <li className={isSelected("home")}>
            <Link to="/" aria-label="home">
              Home
            </Link>
          </li>
          <li className={isSelected("about")}>
            <Link to="/about" aria-label="about">
              About
            </Link>
          </li>
          <li className={isSelected("work")}>
            <Link to="/work" aria-label="work">
              Work
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
