import { OpenAIEmbeddings } from '@langchain/openai';

// text-embedding-3-small outputs 1536 dimensions by default — matches the
// existing `embedding vector(1536)` columns on user/post exactly, no
// dimension-mismatch handling needed.
const EMBEDDING_MODEL = 'text-embedding-3-small';

let client: OpenAIEmbeddings | null = null;

function getClient(): OpenAIEmbeddings | null {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) return null;
	if (!client) {
		client = new OpenAIEmbeddings({ apiKey, model: EMBEDDING_MODEL });
	}
	return client;
}

// Returns null (not a rejected promise) when OPENAI_API_KEY isn't set, so
// callers can no-op cleanly — this keeps embedding generation opt-in: the
// full test suite creates posts constantly and must never make a real,
// billed API call just because it ran, only when a real key is configured.
export async function embedText(text: string): Promise<number[] | null> {
	const embeddings = getClient();
	if (!embeddings) return null;
	return embeddings.embedQuery(text);
}

export function isSemanticSearchConfigured(): boolean {
	return !!process.env.OPENAI_API_KEY;
}
