import "./App.scss";
import { BrowserRouter as Router } from "react-router-dom";

import Footer from "./components/footer";
import Header from "./components/header";
import Switcher from "./components/switcher";

function App() {
  return (
    <main>
      <Router>
        <Header />
        <Switcher />
        <Footer />
      </Router>
    </main>
  );
}

export default App;
