/**
 * Infra do shell que não passa pelo TypeScript: public/, netlify.toml e o
 * script do New Relic. Critérios de aceite de BLUEPRINT §10.1, §10.3 e das
 * notas de privacidade do i18n (_notes.privacy_conditionals, launch blocker 7).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { METHOD_SHORT_PATH, METHOD_SHORT_UTM, urlFor } from "@/config/routes";
import { PREFIXO_DE_MIDIA } from "@/content/midia";
import { THEME_COLOR } from "@/config/site";
import { LOCALES } from "@/i18n/locales";

import { LOGO_PATH } from "./seo";

const ROOT = process.cwd();
const read = (...path: string[]) => readFileSync(join(ROOT, ...path), "utf8");

describe("New Relic (public/scripts/newrelic.js)", () => {
  const source = read("public", "scripts", "newrelic.js");
  const init = source.slice(source.indexOf("NREUM.init"), source.indexOf("NREUM.loader_config"));

  it("gravação de sessão DESLIGADA (B274): só velocidade, erros e PageAction", () => {
    expect(init).toMatch(/session_replay:\s*\{\s*enabled:\s*false/);
    expect(init).toMatch(/sampling_rate:\s*0\b/);
    expect(init).toMatch(/error_sampling_rate:\s*0\b/);
    expect(init).not.toMatch(/jserrors:\s*\{\s*enabled:\s*false/);
    expect(init).not.toMatch(/page_action:\s*\{\s*enabled:\s*false/);
  });

  it("formulários fora do replay e todo texto/entrada mascarado", () => {
    expect(init).toMatch(/block_selector:\s*'\[data-nr-block\], form'/);
    expect(init).toMatch(/mask_all_inputs:\s*true/);
    expect(init).toMatch(/mask_text_selector:\s*'\*'/);
  });

  it("é o loader externo (nada inline no HTML) e não muda a conta", () => {
    expect(source).toContain('accountID: "6460432"');
    expect(source).toContain('applicationID: "601533249"');
    expect(source).toContain("nr-loader-spa-1.281.0");
  });
});

describe("public/", () => {
  it("manifest coerente com o <meta theme-color> e com ícones que existem", () => {
    const manifest = JSON.parse(read("public", "manifest.json")) as {
      theme_color: string;
      icons: { src: string; sizes: string; purpose?: string }[];
      description?: string;
    };
    expect(manifest.theme_color).toBe(THEME_COLOR);
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(true);
    for (const icon of manifest.icons) expect(existsSync(join(ROOT, "public", icon.src))).toBe(true);
    expect(JSON.stringify(manifest)).not.toMatch(/squad/i);
  });

  it("favicon de marca, apple-touch-icon e logo do JSON-LD", () => {
    for (const file of ["favicon.ico", "favicon.svg", "apple-touch-icon.png", LOGO_PATH.slice(1)]) {
      expect(existsSync(join(ROOT, "public", file)), file).toBe(true);
    }
  });

  it("robots.txt aponta o sitemap e não bloqueia o site", () => {
    const robots = read("public", "robots.txt");
    expect(robots).toMatch(/^Sitemap: https:\/\/lemamon\.dev\/sitemap-index\.xml$/m);
    expect(robots).not.toMatch(/^Disallow: \/\s*$/m);
  });

  it("sem catch-all de SPA (public/_redirects apagado)", () => {
    expect(existsSync(join(ROOT, "public", "_redirects"))).toBe(false);
  });
});

describe("netlify.toml (BLUEPRINT §10.1)", () => {
  const toml = read("netlify.toml");
  const rules = [...toml.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\n\[\[|\n# -|$)/g)].map((m) => m[1] ?? "");
  const field = (rule: string, name: string) => rule.match(new RegExp(`${name}\\s*=\\s*"?([^"\\n]+)"?`))?.[1]?.trim();

  it("Node 22 e Yarn 1, build do Astro em dist", () => {
    expect(toml).toMatch(/NODE_VERSION = "22"/);
    expect(toml).toMatch(/YARN_VERSION = "1\.22\.22"/);
    expect(toml).toMatch(/publish = "dist"/);
  });

  it("install congelado e devDependencies instaladas (B255, B249)", () => {
    expect(toml).toMatch(/^\s*YARN_FLAGS = "--frozen-lockfile"/m);
    expect(toml).not.toMatch(/^\s*NODE_ENV\s*=/m);
  });

  it("redirects na ordem e com os status de §10.1, sem catch-all", () => {
    const summary = rules.map((rule) => `${field(rule, "from")} → ${field(rule, "to")} ${field(rule, "status")}`);
    expect(summary).toEqual([
      "https://boring-shockley-7c50b2.netlify.app/* → https://lemamon.dev/:splat 301",
      "/projects → /orcamento 301",
      "/projects/* → /orcamento 301",
      "/diagnostico → /orcamento 301",
      "/metodo → /como-trabalhamos?utm_source=resumo_copiado&utm_medium=compartilhamento 301",
      "/en/method → /en/how-we-work?utm_source=resumo_copiado&utm_medium=compartilhamento 301",
      "/es/metodo → /es/como-trabajamos?utm_source=resumo_copiado&utm_medium=compartilhamento 301",
      "/lemamon → / 301",
      "/home → / 301",
      "/post/* → / 301",
      "/ → /en/ 301",
      "/ → /es/ 301",
      "/blog → / 302",
      "/contact → /contato 301",
      "/quote → /orcamento 301",
      "/Diagnostico → /orcamento 301",
      "/servicos/sistema-web → /servicos/sistemas-web 301",
      "/en/projects → /en/quote 301",
      "/es/projects → /es/cotizacion 301",
      "/sitemap.xml → /sitemap-index.xml 301",
      "/index.html → / 301",
      "/en/index.html → /en/ 301",
      "/es/index.html → /es/ 301",
      "/en/* → /en/404.html 404",
      "/es/* → /es/404.html 404",
    ]);
    expect(toml).not.toMatch(/to\s*=\s*"\/index\.html"/);
  });

  it("host do Netlify → lemamon.dev (S01-1): regra de domínio forçada, só o host exato de produção", () => {
    const host = rules.find((rule) => field(rule, "from")?.startsWith("https://")) ?? "";
    expect(field(host, "from")).toBe("https://boring-shockley-7c50b2.netlify.app/*");
    expect(field(host, "to")).toBe("https://lemamon.dev/:splat");
    expect(host).toMatch(/^\s*force = true/m);
    // Deploy preview e branch deploy (deploy-preview-N--… e <branch>--…) são outros hosts: nenhuma regra de domínio casa com eles.
    expect(rules.filter((rule) => /from\s*=\s*"https?:/.test(rule))).toHaveLength(1);
    expect(toml).not.toMatch(/from\s*=\s*"https?:\/\/[^"]*--/);
  });

  it("404 prováveis e /index.html (S01-4, S01-5): 301 forçados para páginas que existem, antes do 404 por idioma", () => {
    const targets: Record<string, string> = {
      "/contact": urlFor("contact", "pt"),
      "/quote": urlFor("quote", "pt"),
      "/Diagnostico": urlFor("quote", "pt"),
      "/servicos/sistema-web": urlFor("service_web_systems", "pt"),
      "/en/projects": urlFor("quote", "en"),
      "/es/projects": urlFor("quote", "es"),
      "/index.html": urlFor("home", "pt"),
      "/en/index.html": urlFor("home", "en"),
      "/es/index.html": urlFor("home", "es"),
    };
    const firstNotFound = rules.findIndex((rule) => field(rule, "status") === "404");
    for (const [from, to] of Object.entries(targets)) {
      const index = rules.findIndex((rule) => field(rule, "from") === from);
      expect(index, from).toBeGreaterThanOrEqual(0);
      expect(index, from).toBeLessThan(firstNotFound);
      expect(field(rules[index] ?? "", "to"), from).toBe(to);
      expect(rules[index], from).toMatch(/^\s*force = true/m);
    }
  });

  it("URL curta do método (Copiar resumo) = METHOD_SHORT_PATH → página do método com a utm", () => {
    for (const locale of LOCALES) {
      const rule = rules.find((item) => field(item, "from") === METHOD_SHORT_PATH[locale]) ?? "";
      expect(field(rule, "to")).toBe(`${urlFor("how_we_work", locale)}?${METHOD_SHORT_UTM}`);
      expect(field(rule, "status")).toBe("301");
    }
  });

  it("/blog 302 SEM force (some sozinho quando blog.html existir) e 404 por idioma sem force", () => {
    const blog = rules.find((rule) => field(rule, "from") === "/blog") ?? "";
    const forced = /^\s*force\s*=/m;
    expect(blog).not.toMatch(forced);
    for (const prefix of ["/en/*", "/es/*"]) {
      expect(rules.find((rule) => field(rule, "from") === prefix)).not.toMatch(forced);
    }
  });

  it("a CSP não mora no toml: vem do dist/_headers gerado no build (B254)", () => {
    const config = toml
      .split("\n")
      .filter((line) => !line.trim().startsWith("#"))
      .join("\n");
    expect(config).not.toMatch(/Content-Security-Policy/i);
    expect(config).not.toMatch(/unsafe-inline/);
  });

  it("cache imutável só nos assets com hash: /_astro/ e /_midia/ (B236)", () => {
    expect(toml).toMatch(/for = "\/_astro\/\*"\s*\n\s*\[headers\.values\]\s*\n\s*Cache-Control = "public, max-age=31536000, immutable"/);
    // Vídeo e legendas do depoimento (src/content/midia.ts): nome com hash do conteúdo.
    expect(PREFIXO_DE_MIDIA).toBe("/_midia/");
    expect(toml).toMatch(/for = "\/_midia\/\*"\s*\n\s*\[headers\.values\]\s*\n\s*Cache-Control = "public, max-age=31536000, immutable"/);
    // Nenhuma outra regra com immutable (HTML e public/ sem hash ficam no padrão).
    const immutableRules = [...toml.matchAll(/for = "([^"]+)"\s*\n\s*\[headers\.values\][^[]*?immutable/g)].map((m) => m[1]);
    expect(immutableRules).toEqual(["/_astro/*", "/_midia/*"]);
  });
});

describe("tsconfig.json (B232)", () => {
  it("o astro check não olha legacy/ (o app React antigo; CONTRACT §1)", () => {
    const tsconfig = JSON.parse(read("tsconfig.json")) as { exclude: string[] };
    expect(tsconfig.exclude).toEqual(expect.arrayContaining(["legacy", "dist", "dist-e2e", "dist-ficticio", "node_modules"]));
  });
});

describe("package.json (B249, B295)", () => {
  const pkg = JSON.parse(read("package.json")) as {
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  it("dependencies só com o que o site publicado usa; ferramentas de build e tipos em devDependencies", () => {
    expect(Object.keys(pkg.dependencies).sort()).toEqual(["@astrojs/mdx", "@astrojs/react", "@astrojs/sitemap", "astro", "react", "react-dom"]);
    for (const tool of ["@astrojs/check", "typescript", "@types/react", "@types/react-dom", "@emnapi/runtime"]) {
      expect(pkg.devDependencies[tool], tool).toBeTruthy();
    }
  });

  it("o build confere a paridade do i18n antes do astro check", () => {
    expect(pkg.scripts.build).toMatch(/^node scripts\/check-i18n\.mjs && astro check && astro build$/);
  });
});

describe("CI e atualização de dependências (B240, B253, B276)", () => {
  it("CI em todo PR e push na main: install congelado, i18n, astro check, testes, build e E2E", () => {
    const ci = read(".github", "workflows", "ci.yml");
    expect(ci).toMatch(/^on:\s*\n\s+pull_request:/m);
    expect(ci).toMatch(/push:\s*\n\s+branches: \[main\]/);
    const steps = ["yarn install --frozen-lockfile", "yarn i18n:check", "yarn run check", "yarn test", "yarn build", "yarn test:e2e"];
    let last = -1;
    for (const step of steps) {
      const at = ci.indexOf(`run: ${step}`);
      expect(at, step).toBeGreaterThan(last);
      last = at;
    }
    // `yarn check` (sem run) é o comando nativo do Yarn 1, não o script.
    expect(ci).not.toMatch(/run: yarn check\b/);
  });

  it("E2E diário em produção cobre envio e fallback de WhatsApp com a medição bloqueada e avisa por issue (B240)", () => {
    const daily = read(".github", "workflows", "e2e-producao.yml");
    expect(daily).toMatch(/cron: "0 10 \* \* \*"/);
    expect(daily).toMatch(/E2E_NETLIFY_URL: https:\/\/lemamon\.dev/);
    expect(daily).toMatch(/if: failure\(\)[\s\S]*gh issue create/);
    // O caminho do dinheiro roda pela versão segura para produção...
    expect(daily).toMatch(/run: yarn playwright test .*tests\/e2e\/shell-money-path-prod\.spec\.ts/);
    // ...e não pela do integrador, que exige o número fixo do build de E2E.
    expect(daily).not.toMatch(/run: .*quote-money-path/);
    // A spec de produção bloqueia GA4/Ads/NR, intercepta o POST do Netlify e
    // lê o número do WhatsApp da página.
    const spec = read("tests", "e2e", "shell-money-path-prod.spec.ts");
    expect(spec).toMatch(/page\.route\(TRACKERS, \(route\) => route\.abort\(\)\)/);
    for (const host of ["googletagmanager", "google-analytics", "googleadservices", "doubleclick", "nr-data", "newrelic"]) {
      expect(spec, host).toContain(host);
    }
    expect(spec).toMatch(/stubNetlify\(page, 200\)/);
    expect(spec).toMatch(/stubNetlify\(page, 500\)/);
    expect(spec).toMatch(/strayPosts\)\.toEqual\(\[\]\)/);
    expect(spec).toMatch(/const number = await publishedNumber\(page\)/);
  });

  it("modelo de PR com o checklist de copy (B302)", () => {
    const template = read(".github", "pull_request_template.md");
    expect(template).toMatch(/^## Copy \(B302\)$/m);
    for (const path of ["src/i18n/**", "src/content/**", "scripts/build-og-image.sh", "public/assets/img/og/**"]) {
      expect(template, path).toContain(path);
    }
    expect(template).toMatch(/Teste da negação: se o concorrente consegue escrever o contrário sem parecer ridículo, reescreva/);
    expect(template.match(/^- \[ \] /gm)?.length ?? 0).toBeGreaterThanOrEqual(15);
  });

  it("Renovate agrupado por ecossistema, com automerge só de patch", () => {
    const renovate = JSON.parse(read("renovate.json")) as { packageRules: { groupName?: string; matchUpdateTypes?: string[]; automerge?: boolean }[] };
    expect(renovate.packageRules.map((rule) => rule.groupName).filter(Boolean)).toEqual(["astro", "react", "testes"]);
    const auto = renovate.packageRules.filter((rule) => rule.automerge);
    expect(auto).toEqual([{ matchUpdateTypes: ["patch"], automerge: true }]);
  });
});
