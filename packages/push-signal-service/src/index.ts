import { genericLogger } from "signalhub-commons";
import app from "./app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  genericLogger.info(`push-signal-service: listening on ${port}`);
});
