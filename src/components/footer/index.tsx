import { useEffect, useState } from "react";
import { useHistory } from "react-router";

function Footer() {
  const [selected, select] = useState(window.location.pathname);
  const history = useHistory();

  useEffect(() => {
    return history.listen((location) => {
      select(location.pathname);
    });
  }, [history]);

  return (
    <footer style={selected === "/" ? { backgroundColor: "transparent" } : {}}>
      <nav>
        <ul>
          <li>
            <a href="https://github.com/lemamon">Github</a>
          </li>
          <li>
            <a href="https://linkedin.com/in/lemamon">Linkedin</a>
          </li>
          <li>
            <a href="https://instagram.com/lemamon">Instagram</a>
          </li>
          <li>
            <a href="https://twitter.com/lemamon">Twitter</a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Footer;
