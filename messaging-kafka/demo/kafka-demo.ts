import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'pars-demo', brokers: ['localhost:9092'] });
const topic = 'pars-demo-topic';

const run = async () => {
	const admin = kafka.admin();
	await admin.connect();
	await admin.createTopics({ topics: [{ topic, numPartitions: 1 }] });
	await admin.disconnect();

	const consumer = kafka.consumer({ groupId: 'pars-demo-group' });
	await consumer.connect();
	await consumer.subscribe({ topic, fromBeginning: true });

	const received = new Promise<string>((resolve) => {
		consumer.run({
			eachMessage: async ({ message }) => {
				resolve(message.value?.toString() ?? '');
			},
		});
	});

	const producer = kafka.producer();
	await producer.connect();
	await producer.send({ topic, messages: [{ value: 'hello from pars kafka demo' }] });
	await producer.disconnect();

	const value = await received;
	console.log('Received:', value);

	await consumer.disconnect();
	process.exit(0);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
