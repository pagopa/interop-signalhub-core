import express, { Router } from "express";
import { produceAgreementEvent } from "../agreement/index.js";
import { producer } from "../index.js";
import {
  AgreementEventType,
  getAgreementV1ByType,
} from "../agreement/agreementV1.event.js";
import {
  AgreementEventV2Type,
  getAgreementV2ByType,
} from "../agreement/agreementV2.event.js";
import { AgreementEvent } from "@pagopa/interop-outbound-models";

const agreementRouter: Router = express.Router();

agreementRouter.get("/V1/:typeId", async (req, res, next) => {
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

agreementRouter.get("/V2/:typeId", async (req, res, next) => {
  const { typeId } = req.params;
  const typeEvent = AgreementEventV2Type.safeParse(typeId);

  if (!typeEvent.success) {
    res.status(400).send("Invalid typeId");
    next();
    return;
  }
  const agreementEvent = getAgreementV2ByType(typeEvent.data!);
  const message = produceAgreementEvent(agreementEvent);
  await producer.send({
    messages: [{ value: message }],
  });

  res.send(agreementEvent);
});

agreementRouter.post("/", async (req, res) => {
  const agreementEvent: AgreementEvent = req.body;

  const message = produceAgreementEvent(agreementEvent);
  await producer.send({
    messages: [{ value: message }],
  });

  res.send(agreementEvent);
});

export default agreementRouter;
