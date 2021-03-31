import "./App.scss";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from "react-router-dom";
import homeBanner from "./assets/images/banner_home.png";
import { useEffect, useState } from "react";

function Home() {
  return (
    <section className="home">
      <div className="title-container">
        <h2 className="title">
          Deyvid <b>Marinho</b>
        </h2>
        <h5 className="subtitle">Software Engineer</h5>
      </div>

      <img className="banner" alt="cat banner" src={homeBanner} />
    </section>
  );
}

function About() {
  return (
    <section className="about">
      <div className="resume">
        <h3>About me</h3>
        <p>
          Proactive and responsible professional, with the ability to learn with
          easy. Knowledgeable with web and mobile technologies. And also with
          Agile development methodologies. An enthusiast of new and upcoming
          Technologies.
        </p>
      </div>

      <div className="contact">
        <h3>Contact</h3>
        <p>
          Interested in working together? Let's chat! Email me{" "}
          <b>demmarinho@gmail.com</b>
        </p>
      </div>

      <div className="skills">
        <h3>Skills (aka alphabet soup)</h3>
        <p>
          JavaScript, React, Android, iOS, ReactNative, Axe, Pyhton,C/C++, Java,
          Python, C#, PHP, Clojure, Office Package, AutoCad, Unity 3D, Git,
          Gitlab, MatLab/Octave, Windows, Linux Firebase, Firebase Fuctions,
          Polymer, Web-Components, Progressive Web-apps, Windows Phone, Entity
          Framework, NodeJS, Cordova/PhoneGap, Scrum, Kaban, Agile
          Methodology,Xamarin, TDD, jQuery, CSS, MDL, Materialize, OpenCV, HTML,
          MySQL, MongoDB, npm, ExpressJS, AngularJS, Loopback, ReactJS, GraphQL,
          Prisma, Apollo, Relay, Relay Modern, BulmaCSS, Firebase Firestore.
        </p>
      </div>
    </section>
  );
}

function Item({ color }: { color: string }) {
  return (
    <div className="item" style={{ backgroundColor: color }}>
      <h3>Project Name - Client</h3>
      <p>project description</p>
    </div>
  );
}

function Work() {
  return (
    <section className="work">
      <div className="list">
        <Item color="#26ff92" />
        <Item color="transparent" />
        <Item color="#88f3ec" />
        <Item color="#7de9c1" />

        <Item color="#7de0ff" />
        <Item color="#ac64ff" />
        <Item color="transparent" />
        <Item color="#fb7ff2" />

        <Item color="#ffff63" />

        <Item color="#ffaf68" />
        <Item color="transparent" />
        <Item color="#ff8888" />
      </div>
    </section>
  );
}

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
        {console.log(isAbout)}
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
