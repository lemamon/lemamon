import React, { useState } from "react";
import { Button } from "../../common/Button";
import { FormCard, ButtonWrapper } from "./styles";
import { ContactFormProps } from "./types";
import { Result } from "antd";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ContactForm: React.FC<ContactFormProps> = ({
  email,
  phone,
  description,
  onEmailChange,
  onPhoneChange,
  onDescriptionChange,
  onBack,
  onSubmit,
  isValidEmail,
  name,
  onNameChange,
}) => {
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useHistory();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit();
      setError(false);
      setSuccess(true);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FormCard>
        <Result
          status="info"
          title={t("contactForm.creatingProjectTitle")}
          subTitle={t("contactForm.creatingProjectSubTitle")}
        />
      </FormCard>
    );
  }

  if (success) {
    return (
      <FormCard>
        <Result
          status="success"
          title={t("contactForm.successTitle")}
          subTitle={t("contactForm.successSubTitle")}
          extra={[
            <Button key="back" color="#fff">
              {t("contactForm.createAnotherProject")}
            </Button>,
            <Button key="home">{t("contactForm.goHome")}</Button>,
          ]}
        />
      </FormCard>
    );
  }

  if (error) {
    return (
      <FormCard>
        <Result
          status="error"
          title={t("contactForm.errorTitle")}
          extra={[
            <Button key="back" color="#fff" onClick={() => handleSubmit()}>
              Tentar novamente
            </Button>,
            <Button key="home" onClick={() => navigate.push("/")}>
              Voltar ao início
            </Button>,
          ]}
        />
      </FormCard>
    );
  }

  return (
    <FormCard>
      <h6>{t("contactForm.fillFormTitle")}</h6>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="name">{t("contactForm.labelName")}</label>
          <input id="name" value={name} onChange={onNameChange} />
        </div>
        <div>
          <label htmlFor="email">{t("contactForm.labelEmail")}</label>
          <input id="email" value={email} onChange={onEmailChange} />
        </div>
        <div>
          <label htmlFor="phone">{t("contactForm.labelPhone")}</label>
          <input id="phone" value={phone} onChange={onPhoneChange} />
        </div>
        <div>
          <label htmlFor="description">
            {t("contactForm.labelDescription")}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={onDescriptionChange}
          />
        </div>
        <ButtonWrapper>
          <Button color="#fff" onClick={onBack}>
            {t("contactForm.backButton")}
          </Button>
          <Button disabled={!isValidEmail} onClick={handleSubmit}>
            {t("contactForm.sendButton")}
          </Button>
        </ButtonWrapper>
      </form>
    </FormCard>
  );
};

export default ContactForm;
