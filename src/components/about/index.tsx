import banner from "./../../assets/images/banner_about.png";
function About() {
  return (
    <section className="about">
      <div className="container">
        <div className="text-container">
          <div className="resume">
            <h3>About me</h3>
            <p>
              Proactive and responsible professional, with the ability to learn
              with easy. Knowledgeable with web and mobile technologies. And
              also with Agile development methodologies. An enthusiast of new
              and upcoming Technologies.
            </p>
          </div>

          <div className="contact">
            <h3>Contact</h3>
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
            <h3>Skills (aka alphabet soup)</h3>
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
