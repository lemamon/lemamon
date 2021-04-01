import "./App.scss";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import Footer from "./components/footer";
import Home from "./components/home";
import Work from "./components/work";
import About from "./components/about";
import Header from "./components/header";

function App() {
  return (
    <main>
      <Router>
        <Header />
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/work">
            <Work />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
        <Footer />
      </Router>
    </main>
  );
}

export default App;
