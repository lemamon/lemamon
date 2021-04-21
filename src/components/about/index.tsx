import banner from "./../../assets/images/banner_about.png";

function About() {
  return (
    <section id={"about"} className="about">
      <div className="container">
        <div className="text-container">
          <div className="title-container">
            <h3 className="title">About me 📝</h3>
          </div>
          <div className="resume">
            <p>
              Proactive and responsible professional, with the ability to learn
              with easy. Knowledgeable with web and mobile technologies. And
              also with Agile development methodologies. An enthusiast of new
              and upcoming Technologies.
            </p>
          </div>

          <div className="contact">
            <h4>Contact 📬</h4>
            <p>
              Interested in working together? Let's chat! Email me
              <b>
                <a className="email" href="mailto:demmarinho@gmail.com">
                  {" "}
                  demmarinho@gmail.com
                </a>
              </b>
            </p>
          </div>

          <div className="skills">
            <h4>Skills (aka alphabet soup) 🍜</h4>
            <p>
              JavaScript, React, Android, iOS, ReactNative, Axe, Pyhton,C/C++,
              Java, Python, C#, PHP, Clojure, Office Package, AutoCad, Unity 3D,
              Git, Gitlab, MatLab/Octave, Windows, Linux Firebase, Firebase
              Fuctions, Polymer, Web-Components, Progressive Web-apps, Windows
              Phone, Entity Framework, NodeJS, Cordova/PhoneGap, Scrum, Kaban,
              Agile Methodology,Xamarin, TDD, jQuery, CSS, MDL, Materialize,
              OpenCV, HTML, MySQL, MongoDB, npm, ExpressJS, AngularJS, Loopback,
              ReactJS, GraphQL, Prisma, Apollo, Relay, Relay Modern, BulmaCSS,
              Firebase Firestore.
            </p>
          </div>

          <div className="skills">
            <a href="/assets/pdf/deyvid_marinho_resume.pdf" download>
              {`--> `}Get my resume as pdf 📜{` <--`}
            </a>
          </div>
        </div>
        <figure className={`image-container`}>
          {/* <figure className={`frame`}> */}
          <img src={banner} alt="lemamon" />
          <figcaption>Deyvid Marinho</figcaption>
        </figure>
      </div>
    </section>
  );
}

export default About;
