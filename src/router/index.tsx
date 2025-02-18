import { lazy, Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import routes from "./config";
import { Styles } from "../styles/styles";
import NotFound from "../pages/NotFound";

const componentMap: { [key: string]: () => Promise<any> } = {
  Home: () => import("../pages/Home"),
  Projects: () => import("../pages/Projects"),
  Blog: () => import("../pages/Blog"),
  Post: () => import("../pages/Post"),
};

const Router = () => {
  return (
    <Suspense fallback={null}>
      <Styles />
      <Header />
      <Switch>
        {routes.map((routeItem) => {
          const Component = lazy(componentMap[routeItem.component]);

          return (
            <Route
              key={routeItem.component}
              path={routeItem.path}
              exact={routeItem.exact}
              render={(props) => <Component {...props} />}
            />
          );
        })}
        <Route path="*" component={NotFound} />
      </Switch>
      <Footer />
    </Suspense>
  );
};

export default Router;
