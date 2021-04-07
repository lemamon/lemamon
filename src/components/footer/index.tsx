function Footer({isHome}:{isHome:boolean}) {
  return (
    <footer style={isHome ? { backgroundColor: "transparent" } : {}}>
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
