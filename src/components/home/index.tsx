function Home() {
  return (
    <section className="home">
      <div className="container">
        <div className="title-container">
          <h2 className="title">
            Deyvid <b>Marinho</b>
          </h2>
          <h5 className="subtitle">Software Engineer 👨🏻‍💻</h5>
          {/* <p className="subsubtitle">(a.k.a. dev de applicativozinho)</p> */}
        </div>
        <video autoPlay muted loop className=" home-video">
          <source src="/assets/videos/home-video2.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}

export default Home;
