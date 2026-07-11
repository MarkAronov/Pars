import amqp from 'amqplib';

const run = async () => {
	const conn = await amqp.connect('amqp://pars:pars@localhost:5672');
	const channel = await conn.createChannel();
	const queue = 'pars-demo-queue';
	await channel.assertQueue(queue);

	const received = new Promise<string>((resolve) => {
		channel.consume(queue, (msg) => {
			if (msg) {
				resolve(msg.content.toString());
				channel.ack(msg);
			}
		});
	});

	channel.sendToQueue(queue, Buffer.from('hello from pars rabbitmq demo'));

	const value = await received;
	console.log('Received:', value);

	await channel.close();
	await conn.close();
	process.exit(0);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
