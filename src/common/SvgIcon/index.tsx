import { SvgIconProps } from "../types";
import { useState, useEffect } from "react";

export const SvgIcon = ({ src, width, height }: SvgIconProps) => {
  const [iconSrc, setIconSrc] = useState<string | null>(null);

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || "";
    const iconPath = `${basePath}src/assets/img/svg/${src}`;
    setIconSrc(iconPath);
  }, [src]);

  return iconSrc ? (
    <img src={iconSrc} alt={src} width={width} height={height} />
  ) : (
    <span>Loading...</span>
  );
};
