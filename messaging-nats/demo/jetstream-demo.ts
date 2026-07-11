import { AckPolicy, connect, StringCodec } from 'nats';

const run = async () => {
	const nc = await connect({ servers: 'localhost:4222' });
	const sc = StringCodec();
	const jsm = await nc.jetstreamManager();

	const streamName = 'PARS_DEMO';
	const subject = 'pars.demo.jetstream';

	await jsm.streams.add({ name: streamName, subjects: [subject] });
	await jsm.consumers.add(streamName, { ack_policy: AckPolicy.Explicit });

	const js = nc.jetstream();
	await js.publish(subject, sc.encode('hello from pars nats jetstream demo'));

	const consumer = await js.consumers.get(streamName);
	const messages = await consumer.consume({ max_messages: 1 });
	for await (const m of messages) {
		console.log('Received:', sc.decode(m.data));
		m.ack();
		break;
	}

	await jsm.streams.delete(streamName);
	await nc.drain();
	process.exit(0);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
