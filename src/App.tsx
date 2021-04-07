import "./App.scss";
import { HashRouter as Router } from "react-router-dom";

import Footer from "./components/footer";
import Header from "./components/header";
import Switcher from "./components/switcher";
import { useEffect, useState } from "react";

function App() {
  const [isHome, setIsHome] = useState(true);
  useEffect(() => {
    window.onscroll = function () {
      console.log(window.pageYOffset);
      setIsHome(window.pageYOffset < 400);
    };

    return () => {
      window.onscroll = null;
    };
  }, []);
  return (
    <main>
      <Router>
        <Header isHome={isHome} />
        <Switcher />
        <Footer isHome={isHome} />
      </Router>
    </main>
  );
}

export default App;
