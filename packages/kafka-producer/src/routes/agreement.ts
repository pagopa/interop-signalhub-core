import express, { Router } from "express";
import { produceAgreementEvent } from "../agreement/index.js";
import { producer } from "../index.js";
import { AgreementEventType, getAgreementV1ByType } from "./agreement.event.js";
const agreementRouter: Router = express.Router();

agreementRouter.get("/:typeId", async (req, res, next) => {
  const { typeId } = req.params;
  const typeEvent = AgreementEventType.safeParse(typeId);

  if (!typeEvent.success) {
    res.status(400).send("Invalid typeId");
    next();

    return;
  }

  const agreementEvent = getAgreementV1ByType(typeEvent.data!);

  const message = produceAgreementEvent(agreementEvent);
  await producer.send({
    messages: [{ value: message }],
  });

  res.send(agreementEvent);
});

export default agreementRouter;
