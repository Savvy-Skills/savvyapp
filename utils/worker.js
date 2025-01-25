const workerFunction = function() {
	async function loadScriptWithRetry(url, name, retries = 3, delay = 1000) {
	  for (let i = 0; i < retries; i++) {
		try {
		  importScripts(url);
		  console.log("Successfully loaded: " + name);
		  return;
		} catch (err) {
		  console.error(
			"Failed to load: " + name + ", attempt " + (i + 1) + " of " + retries
		  );
		  if (i < retries - 1) {
			await new Promise((resolve) => setTimeout(resolve, delay));
		  } else {
			throw new Error(
			  "Failed to load script after " + retries + " attempts: " + name
			);
		  }
		}
	  }
	}
	
	async function init() {
	  const scripts = {
		tfjs: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js",
		wasm: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.js",
	  };
	  try {
		await loadScriptWithRetry(scripts.tfjs, "tfjs");
		await loadScriptWithRetry(scripts.danfojs, "danfojs");
		await loadScriptWithRetry(scripts.wasm, "wasm");
	
		tf.wasm.setWasmPaths(
		  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/wasm-out/"
		);
	
		self.onmessage = async function (event) {
		  console.log("Message received:", event.data);
		  switch (event.data.type) {
			case MESSAGE_TYPE_CREATE_TRAIN:
			  break;
			case MESSAGE_TYPE_REMOVE:
			  break;
			case MESSAGE_TYPE_STOP:
			  break;
			default:
			  self.postMessage({
				type: MESSAGE_TYPE_ERROR,
				message: "Unknown message type!",
			  });
			  break;
		  }
		};
	  } catch (err) {
		console.error("Error:", err);
	  }
	}
	
	init();
}

const code = workerFunction.toString();
let mainCode = code.replace(/^function\s*\w*\s*\(/, "").replace(/\s*\)$/, "");
let blob = new Blob([mainCode], { type: "application/javascript" });
let workerScript = URL.createObjectURL(blob);

export { workerScript };
