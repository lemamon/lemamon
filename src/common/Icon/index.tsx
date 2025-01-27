import * as AntIcons from "@ant-design/icons";

type IconProps = {
  iconKey: string;
  [key: string]: any;
};

const Icon = ({ iconKey, ...props }: IconProps) => {
  const DynamicIcon = AntIcons[iconKey as keyof typeof AntIcons] as any;

  if (!DynamicIcon) {
    console.error(`O ícone "${iconKey}" não foi encontrado no pacote @ant-design/icons.`);
    return null;
  }

  return <DynamicIcon {...props} />;
};

export default Icon;
