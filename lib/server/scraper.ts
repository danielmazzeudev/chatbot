import crypto from "node:crypto";
import { load } from "cheerio";

const SITE_URL = process.env.SITE_URL ?? "https://lumni.dev.br";
const DELAY_MS = Number.parseInt(process.env.SCRAPE_DELAY_MS ?? "2000", 10) || 2000;
const USER_AGENT = "LumniBot/1.0 (internal knowledge sync)";
const FALLBACK_URLS = [SITE_URL, `${SITE_URL}/termos-de-uso`, `${SITE_URL}/politica-de-privacidade`];

let lastHash = "";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hash(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function isSameOriginUrl(url: string) {
  try {
    return new URL(url).origin === new URL(SITE_URL).origin;
  } catch {
    return false;
  }
}

async function fetchXml(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  return response.text();
}

async function collectUrlsFromSitemap(sitemapUrl: string, visited = new Set<string>()): Promise<string[]> {
  if (visited.has(sitemapUrl)) {
    return [];
  }

  visited.add(sitemapUrl);

  const xml = await fetchXml(sitemapUrl);
  const $ = load(xml, { xmlMode: true });
  const pageUrls: string[] = [];

  $("url > loc").each((_, element) => {
    const url = $(element).text().trim();
    if (url && isSameOriginUrl(url)) {
      pageUrls.push(url);
    }
  });

  if (pageUrls.length > 0) {
    return pageUrls;
  }

  const nestedSitemaps: string[] = [];
  $("sitemap > loc").each((_, element) => {
    const url = $(element).text().trim();
    if (url && isSameOriginUrl(url)) {
      nestedSitemaps.push(url);
    }
  });

  if (nestedSitemaps.length === 0) {
    return [];
  }

  const nestedResults = await Promise.all(
    nestedSitemaps.map((url) => collectUrlsFromSitemap(url, visited)),
  );

  return nestedResults.flat();
}

async function getUrlsFromSitemap() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;

  try {
    const urls = await collectUrlsFromSitemap(sitemapUrl);

    if (urls.length > 0) {
      const uniqueUrls = [...new Set(urls)];
      console.log(`[Scraper] ${uniqueUrls.length} URLs encontradas via sitemap.xml`);
      return uniqueUrls;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[Scraper] sitemap.xml indisponivel (${message}), usando fallback`);
  }

  return FALLBACK_URLS;
}

function extractText(html: string) {
  const $ = load(html);

  $("script, style, nav, footer, header, noscript, iframe, svg").remove();

  const main = $("main").length ? $("main") : $("body");

  return main
    .text()
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPage(url: string) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    });

    if (!response.ok) {
      console.log(`[Scraper] ${url} retornou status ${response.status}, pulando`);
      return null;
    }

    return response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[Scraper] Erro ao acessar ${url}: ${message}`);
    return null;
  }
}

export async function scrapeSite() {
  console.log(`[Scraper] Iniciando scrape de ${SITE_URL}...`);

  const urls = await getUrlsFromSitemap();
  const parts: Array<{ page: string; text: string }> = [];

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    const html = await fetchPage(url);

    if (html) {
      const text = extractText(html);
      if (text.length > 50) {
        const pagePath = url.replace(SITE_URL, "") || "/";
        parts.push({ page: pagePath, text });
      }
    }

    if (index < urls.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  if (parts.length === 0) {
    console.log("[Scraper] Nenhum conteudo extraido do site");
    return { text: "", changed: false };
  }

  const fullText = parts.map((part) => `--- Pagina: ${part.page} ---\n${part.text}`).join("\n\n");
  const nextHash = hash(fullText);
  const changed = lastHash !== nextHash;

  if (changed) {
    lastHash = nextHash;
    console.log(`[Scraper] Conteudo atualizado (${parts.length} paginas, ${fullText.length} chars)`);
  } else {
    console.log("[Scraper] Conteudo do site nao mudou, pulando rebuild");
  }

  return { text: fullText, changed };
}
