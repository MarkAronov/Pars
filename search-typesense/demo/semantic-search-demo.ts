import { Embeddings } from '@langchain/core/embeddings';
import { Document } from '@langchain/core/documents';
import { Typesense } from '@langchain/community/vectorstores/typesense';
import { Client } from 'typesense';

// Deterministic bag-of-words pseudo-embedding — no external API key needed.
// Real usage wires this to the same embedding model that populates the
// `embedding vector(1536)` columns in database-postgres-pgvector's schema.
const DIM = 128;

const embed = (text: string): number[] => {
	const vec = new Array<number>(DIM).fill(0);
	for (const word of text.toLowerCase().split(/\W+/).filter(Boolean)) {
		let hash = 0;
		for (const ch of word) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
		vec[hash % DIM] += 1;
	}
	const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
	return vec.map((v) => v / norm);
};

class DemoEmbeddings extends Embeddings {
	constructor() {
		super({});
	}

	async embedDocuments(texts: string[]): Promise<number[][]> {
		return texts.map(embed);
	}

	async embedQuery(text: string): Promise<number[]> {
		return embed(text);
	}
}

const collectionName = 'pars_demo_posts';

const run = async () => {
	const client = new Client({
		nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
		apiKey: process.env.TYPESENSE_API_KEY ?? 'pars-dev-key',
		connectionTimeoutSeconds: 10,
	});

	await client.collections(collectionName).delete().catch(() => undefined);
	await client.collections().create({
		name: collectionName,
		fields: [
			{ name: 'text', type: 'string' },
			{ name: 'vec', type: 'float[]', num_dim: DIM },
		],
	});

	const embeddings = new DemoEmbeddings();
	const vectorStore = new Typesense(embeddings, {
		typesenseClient: client,
		schemaName: collectionName,
	});

	await vectorStore.addDocuments([
		new Document({ pageContent: 'Pars is a social platform for posts, follows, and threads' }),
		new Document({ pageContent: 'Bun is a fast JavaScript runtime and package manager' }),
		new Document({ pageContent: 'Postgres with pgvector stores embedding vectors for search' }),
	]);

	const results = await vectorStore.similaritySearchVectorWithScore(
		embed('a runtime for running JavaScript fast'),
		1,
	);

	console.log(
		'Best match:',
		results[0]?.[0].pageContent,
		'(distance:',
		results[0]?.[1],
		')',
	);

	await client.collections(collectionName).delete();
	process.exit(0);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
