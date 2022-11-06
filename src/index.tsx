import { render } from "solid-js/web";
import App from "./App";

import LOG_LEVEL_DEBUG from "./global";
if (!LOG_LEVEL_DEBUG) {
  window.console.debug = () => {};
}

render(() => <App />, document.getElementById("root")!);
