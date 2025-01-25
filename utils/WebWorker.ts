export default class WebWorker extends Worker {
	constructor(worker: Worker) {
		const code = worker.toString();
		const blob = new Blob([`(${code})()`], { type: "application/javascript" });
		super(URL.createObjectURL(blob));
	}
}
