import LinkButton from "../LinkButton";

function DownloadResume() {
  return (
    <>
      <LinkButton href="/assets/pdf/deyvid_marinho_resume.pdf" download>
        {`--> `}Get my resume as pdf 📜{` <--`}
      </LinkButton>
    </>
  );
}

export default DownloadResume;
