import { projects } from "../../data/index.json";

interface IProject {
  title: string;
  description: string;
  client: string;
  company: string;
  jobTitle: string;
  date: string;
  background: string;
  images: string[];
}

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

function Item({
  title,
  description,
  jobTitle,
  company,
  client,
  background,
}: IProject) {
  return (
    <div className="item" style={{ backgroundColor: background }}>
      <h3> {title}</h3>
      <h5>{jobTitle} - {company} - {client}</h5>
      <p>{description}</p>
    </div>
  );
}

function Work() {
  return (
    <section className="work">
      <div className="list">
        {shuffle(projects).map((item, index) => (
          <Item key={index} {...item} />
        ))}
        {/* 
        Item color="#26ff92"/>
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
        <Item color="#ff8888" /> */}
      </div>
    </section>
  );
}

export default Work;
