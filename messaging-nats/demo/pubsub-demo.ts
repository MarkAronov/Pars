import { connect, StringCodec } from 'nats';

const run = async () => {
	const nc = await connect({ servers: 'localhost:4222' });
	const sc = StringCodec();
	const subject = 'pars.demo.pubsub';

	const sub = nc.subscribe(subject, { max: 1 });
	const received = (async () => {
		for await (const msg of sub) {
			return sc.decode(msg.data);
		}
		return '';
	})();

	nc.publish(subject, sc.encode('hello from pars nats pubsub demo'));

	console.log('Received:', await received);

	await nc.drain();
	process.exit(0);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
