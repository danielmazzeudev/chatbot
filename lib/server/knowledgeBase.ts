import fs from "node:fs/promises";
import path from "node:path";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { scrapeSite } from "@/lib/server/scraper";

const SCRAPE_INTERVAL_MS =
  (Number.parseInt(process.env.SCRAPE_INTERVAL_HOURS ?? "6", 10) || 6) * 60 * 60 * 1000;

let vectorStore: MemoryVectorStore | null = null;
let lastLoadedAt = 0;
let loadPromise: Promise<void> | null = null;

async function loadStaticDocs() {
  const knowledgeDir = path.join(process.cwd(), "knowledge");

  try {
    const entries = await fs.readdir(knowledgeDir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".txt"));
    const docs = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(knowledgeDir, file.name);
        const content = await fs.readFile(filePath, "utf8");

        return new Document({
          pageContent: content,
          metadata: { source: file.name },
        });
      }),
    );

    return docs;
  } catch {
    return [];
  }
}

async function buildVectorStore(siteText: string) {
  const staticDocs = await loadStaticDocs();
  const allDocs = [...staticDocs];

  if (siteText) {
    allDocs.push(
      new Document({
        pageContent: siteText,
        metadata: { source: "website-scrape" },
      }),
    );
  }

  if (allDocs.length === 0) {
    vectorStore = null;
    return;
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(allDocs);

  vectorStore = await MemoryVectorStore.fromDocuments(
    chunks,
    new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    }),
  );

  console.log(
    `[Knowledge] ${chunks.length} chunks carregados (${staticDocs.length} arquivo(s) + site)`,
  );
}

async function refreshKnowledgeBase(force = false) {
  const now = Date.now();
  if (!force && vectorStore && now - lastLoadedAt < SCRAPE_INTERVAL_MS) {
    return;
  }

  const { text, changed } = await scrapeSite();
  if (force || !vectorStore || changed) {
    await buildVectorStore(text);
  }

  lastLoadedAt = now;
}

async function ensureKnowledgeBaseLoaded() {
  if (!loadPromise) {
    loadPromise = refreshKnowledgeBase(!vectorStore).finally(() => {
      loadPromise = null;
    });
  }

  return loadPromise;
}

export async function searchKnowledge(query: string, k = 3) {
  await ensureKnowledgeBaseLoaded();

  if (!vectorStore) {
    return "";
  }

  const results = await vectorStore.similaritySearch(query, k);
  return results.map((result) => result.pageContent).join("\n\n");
}
