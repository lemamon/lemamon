import LinkButton from "../LinkButton";
import Text from "../Text";
import TextTitle from "../TextTitle";

function Contact() {
  return (
    <div>
      <TextTitle>Contact 📬</TextTitle>
      <Text>
        Interested in working together? Let's chat! Email me
        <b>
          <LinkButton href="mailto:demmarinho@gmail.com">
            {" "}
            demmarinho@gmail.com
          </LinkButton>
        </b>
      </Text>
    </div>
  );
}

export default Contact;
