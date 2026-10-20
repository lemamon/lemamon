/**
 * Logo da tecnologia na ficha técnica do case (B212, 03-ui §3.4.2). Dono: gated.
 *
 *   <Badge variant="mono" icon={techIcon(nome)}>{nome}</Badge>
 *
 * Entra o nome como o case REAL escreve em `fichaTecnica.stack` (lista que o
 * dono valida no termo do case, playbook 09 §8); sai o ícone do Icon.astro
 * (home) com o logo daquela tecnologia, ou undefined, e aí o Badge sai só com
 * o rótulo. O logo realça um nome que o case já lista: nunca entra tecnologia
 * por causa do ícone.
 *
 * A comparação ignora caixa, acento, espaço, ponto e hífen ("Node.js" =
 * "nodejs" = "NodeJS"); "+" e "#" contam ("C++", "C#"). Cada logo novo no
 * Icon.astro (currentColor, viewBox 24) ganha uma linha em TECH_ICONS, com a
 * chave já normalizada.
 *
 * Seguro para testes: só tipos e funções puras.
 */
import type { IconName } from "@/components/ui/Icon.astro";

const TECH_ICONS: ReadonlyMap<string, IconName> = new Map<string, IconName>([
  ["github", "github"],
  ["githubactions", "github"],
  ["typescript", "typescript"],
  ["javascript", "javascript"],
  ["react", "react"],
  // React Native usa o mesmo logo do React (o átomo).
  ["reactnative", "react"],
  ["nodejs", "nodejs"],
  ["node", "nodejs"],
  ["postgresql", "postgresql"],
  ["postgres", "postgresql"],
  ["sqlite", "sqlite"],
  ["nextjs", "nextjs"],
  ["astro", "astro"],
  ["docker", "docker"],
]);

/** Chave de comparação do nome da tecnologia ("Node.js" → "nodejs"). */
export function techKey(nome: string): string {
  return nome
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");
}

/** Ícone com o logo da tecnologia, ou undefined (o Badge sai só com o rótulo). */
export function techIcon(nome: string): IconName | undefined {
  return TECH_ICONS.get(techKey(nome));
}
