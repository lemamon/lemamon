import React, { useState } from "react";
import { Button } from "../../common/Button";
import { FormCard, ButtonWrapper } from "./styles";
import { ContactFormProps } from "./types";
import { Result } from "antd";
import { useHistory } from "react-router-dom";

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
          title="Criando seu projeto"
          subTitle="Aguarde um momento."
        />
      </FormCard>
    );
  }

  if (success) {
    return (
      <FormCard>
        <Result
          status="success"
          title="Projeto criado com sucesso!"
          subTitle="Em breve nossa equipe entrará em contato."
          extra={[
            <Button
              key="back"
              color="#fff"
              onClick={() => navigate.push("/projects")}
            >
              Criar outro projeto
            </Button>,
            <Button key="home" onClick={() => navigate.push("/")}>
              Voltar ao início
            </Button>,
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
          title="Erro ao criar projeto"
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
      <h6>Preencha suas informações</h6>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="name">Nome</label>
          <input id="name" value={name} onChange={onNameChange} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={onEmailChange} />
        </div>
        <div>
          <label htmlFor="phone">Telefone</label>
          <input id="phone" value={phone} onChange={onPhoneChange} />
        </div>
        <div>
          <label htmlFor="description">Descreva sua ideia</label>
          <textarea
            id="description"
            value={description}
            onChange={onDescriptionChange}
          />
        </div>
        <ButtonWrapper>
          <Button color="#fff" onClick={onBack}>
            Voltar
          </Button>
          <Button disabled={!isValidEmail} onClick={handleSubmit}>
            Enviar
          </Button>
        </ButtonWrapper>
      </form>
    </FormCard>
  );
};

export default ContactForm;
