import Contact from "../Contact";
import Resume from "../Resume";
import Skills from "../Skills";
import Title from "../Title";
import DownloadResume from "../DownloadResume";

function TextContainer() {
  return (
    <div>
      <Title color="#fff">About me 📝</Title>
      <Resume />
      <Contact />
      <Skills />
      <DownloadResume />
    </div>
  );
}

export default TextContainer;
