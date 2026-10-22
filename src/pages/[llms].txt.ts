/**
 * /llms.txt (auditoria SEO S05-10; dono: shell). O texto vem de
 * src/components/shell/llms.ts, gerado do i18n e das flags do build.
 *
 * NUNCA com a camada de dados fictícios: com ela ligada, getStaticPaths não
 * devolve nada e o arquivo não existe no build. O nome entre colchetes só
 * existe para isso (uma rota estática sempre geraria o arquivo).
 */
import type { APIRoute, GetStaticPaths } from "astro";

import { buildLlmsTxt } from "@/components/shell/llms";
import { MODO_FICTICIO } from "@/config/dono";
import { getFeatures } from "@/config/features";

export const getStaticPaths = (() => (MODO_FICTICIO ? [] : [{ params: { llms: "llms" } }])) satisfies GetStaticPaths;

export const GET: APIRoute = async () =>
  new Response(buildLlmsTxt(await getFeatures()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
