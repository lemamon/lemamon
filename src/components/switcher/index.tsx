import { Switch, Route } from "react-router-dom";

import Home from "./../home";
import Work from "./../work";
import About from "./../about";

import { Fragment } from "react";

function Main() {
  return (
    <Fragment>
      <Home />
      <About />
      <Work />
    </Fragment>
  );
}

function Switcher() {
  return (
    <>
      <Switch>
        <Route path="#about">
          <About />
        </Route>
        <Route path="#work">
          <Work />
        </Route>
        <Route path="#">
          <Home />
        </Route>
      </Switch>
      <Main />
    </>
  );
}

export default Switcher;
