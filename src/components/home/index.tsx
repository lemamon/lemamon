import homeBanner from "../../assets/images/banner_home.png";

function Home() {
  return (
    <section className="home">
      <div className="container">
        <div className="title-container">
          <h2 className="title">
            Deyvid <b>Marinho</b>
          </h2>
          <h5 className="subtitle">Software Engineer</h5>
        </div>

        <img className="banner" alt="cat banner" src={homeBanner} />
      </div>
    </section>
  );
}

export default Home;
