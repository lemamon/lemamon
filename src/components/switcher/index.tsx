import { Switch, Route } from "react-router-dom";

import Home from "./../home";
import Work from "./../work";
import About from "./../about";

function Switcher() {
  return (
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
  );
}

export default Switcher;
