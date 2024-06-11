import { updaterBuilder } from "./updater.js";

const task = await updaterBuilder();

task.executeTask();
