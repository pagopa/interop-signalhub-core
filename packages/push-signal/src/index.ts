import { genericLogger } from "pagopa-signalhub-commons";

import app from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, config.host, () => {
  genericLogger.info(
    `push-signal-service: listening on ${config.host}:${config.port}`,
  );
});
