import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";

function Footer() {
  const [isAbout, setIsAbout] = useState(false);

  const history = useHistory();

  useEffect(() => {
    return history.listen((location) => {
      setIsAbout(location.pathname?.includes("about"));
    });
  }, [history]);

  return (
    <footer style={{ backgroundColor: isAbout ? "#fe5454" : "transparent" }}>
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
