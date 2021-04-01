import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/" aria-label="home">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" aria-label="about">
              About
            </Link>
          </li>
          <li>
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
