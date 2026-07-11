import { Queue, Worker } from 'bullmq';

const connection = { host: 'localhost', port: 6380 };
const queueName = 'pars-demo-queue';

const run = async () => {
	const queue = new Queue(queueName, { connection });

	const result = new Promise<string>((resolve) => {
		const worker = new Worker(
			queueName,
			async (job) => {
				resolve(`processed job ${job.id} with payload: ${JSON.stringify(job.data)}`);
				return job.data;
			},
			{ connection },
		);
		worker.on('completed', () => {
			void worker.close();
		});
	});

	await queue.add('demo-job', { message: 'hello from pars bullmq demo' });

	console.log(await result);

	await queue.close();
	process.exit(0);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
