import { Row, Col } from "antd";
import { withTranslation } from "react-i18next";
import { Slide } from "react-awesome-reveal";
import { ContactProps } from "./types";
import { Button } from "../../common/Button";
import Block from "../Block";
import { ContactContainer, ButtonContainer } from "./styles";
import { SvgIcon } from "../../common/SvgIcon";

const Contact = ({ title, content, id, t }: ContactProps) => {
  return (
    <ContactContainer id={id}>
      <Row justify="space-between" align="middle">
        <Col lg={12} md={11} sm={24} xs={24}>
          <Slide direction="left" triggerOnce>
            <Block title={title} content={content} />
          </Slide>
        </Col>
        <Col lg={12} md={12} sm={24} xs={24}>
          <Slide direction="right" triggerOnce>
            <>
              <SvgIcon src="contact-us.png" width="100%" height="100%" />
              <ButtonContainer>
                <a href="mailto:lemamon.dev@gmail.com?subject=Contact%20From%20Website">
                  <Button name="submit">{t("contactUs")}</Button>
                </a>
              </ButtonContainer>
            </>
          </Slide>
        </Col>
      </Row>
    </ContactContainer>
  );
};

export default withTranslation()(Contact);
