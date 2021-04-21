import { projects } from "../../data/index.json";
import Card from "../card";

function shuffle(array: any[]) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function Work() {
  return (
    <section id={"work"} className="work">
      <div className="container">
        <div className="title-container">
          <h3 className="title">Work 💼</h3>
        </div>
        <div className="list">
          {shuffle(projects).map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Work;
