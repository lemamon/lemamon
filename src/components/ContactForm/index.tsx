import React from "react";
import { Button } from "../../common/Button";
import { FormCard, ButtonWrapper } from "./styles";
import { ContactFormProps } from "./types";

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
          <Button disabled={!isValidEmail} onClick={onSubmit}>
            Enviar
          </Button>
        </ButtonWrapper>
      </form>
    </FormCard>
  );
};

export default ContactForm;
