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

function Card({
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
      <h5>
        {jobTitle} - {company} - {client}
      </h5>
      <p>{description}</p>
    </div>
  );
}

export default Card;
