/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CatalogEServices {
  results: CatalogEService[];
  pagination: Pagination;
}

export interface CatalogEService {
  /** @format uuid */
  id: string;
  name: string;
  description: string;
}

export interface Client {
  /** @format uuid */
  id: string;
  /** @format uuid */
  consumerId: string;
}

/** eservice descriptor model */
export interface EServiceDescriptor {
  /**
   * eservice descriptor identifier
   * @format uuid
   */
  id: string;
  /** eservice descriptor version */
  version: string;
  /** eservice descriptor description */
  description?: string;
  /** eservice descriptor audience */
  audience: string[];
  /**
   * voucher duration
   * @format int32
   */
  voucherLifespan: number;
  /**
   * max number of daily requests per consumer
   * @format int32
   * @min 0
   */
  dailyCallsPerConsumer: number;
  /**
   * total number of daily requests delivered by the eservice
   * @format int32
   * @min 0
   */
  dailyCallsTotal: number;
  /** eservice descriptor document model */
  interface?: EServiceDoc;
  /** eservice supplementary documents */
  docs: EServiceDoc[];
  /** EService State */
  state: EServiceDescriptorState;
  serverUrls: string[];
}

/** The eservice model */
export interface EService {
  /**
   * eservice identifier
   * @format uuid
   */
  id: string;
  /** organization model */
  producer: Organization;
  /** eservice name */
  name: string;
  /** @pattern ^[0-9]{1,4}$ */
  version: string;
  /** eservice description */
  description: string;
  /** API technlogy admitted */
  technology: EServiceTechnology;
  /** the attributes set associated to the EService */
  attributes: EServiceAttributes;
  /** EService State */
  state: EServiceDescriptorState;
  serverUrls: string[];
}

/** the attributes set associated to the EService */
export interface EServiceAttributes {
  /** certified attributes list */
  certified: EServiceAttribute[];
  /** declared attributes list */
  declared: EServiceAttribute[];
  /** verified attributes list */
  verified: EServiceAttribute[];
}

/**
 * EService attribute model.
 * In the resolution of the expression of the attribute, a single attribute is combined with other attributes
 * with AND operator.
 * A group of attributes combined together with OR oparator; in the resolution of the expression of the attribute,
 * it is combined with other attributes with AND operator.
 */
export interface EServiceAttribute {
  /** attribute value */
  single?: EServiceAttributeValue;
  group?: EServiceAttributeValue[];
}

/** attribute value */
export interface EServiceAttributeValue {
  /**
   * attribute identifier
   * @format uuid
   */
  id: string;
  /**
   * source identifier
   * @maxLength 48
   * @pattern [a-z0-9 \-]{,48}
   */
  code?: string;
  /** external id origin */
  origin?: Origin;
  /**
   * this field is used only in the flow of verified attributes:
   * if true the producer must check the attribute,
   * otherwise, if it is already verified by another producer, it can be implicitly verified
   */
  explicitAttributeVerification: boolean;
}

/** EService State */
export type EServiceDescriptorState = "PUBLISHED" | "DEPRECATED" | "SUSPENDED" | "ARCHIVED";

/** eservice descriptors list model */
export interface EServiceDescriptors {
  descriptors: EServiceDescriptor[];
}

/** EServices list model */
export interface EServices {
  eservices: EService[];
}

/** eservice descriptor document model */
export interface EServiceDoc {
  /**
   * document identifier
   * @format uuid
   */
  id: string;
  /** document name */
  name: string;
  /** document content type */
  contentType: string;
}

/** API technlogy admitted */
export type EServiceTechnology = "REST" | "SOAP";

/** organization identifier model */
export interface ExternalId {
  /** external id origin */
  origin: Origin;
  /** external organization identifier (es codice ipa) */
  id: string;
}

/** Models a JWK */
export interface JWK {
  kty: string;
  key_ops?: string[];
  use?: string;
  alg?: string;
  kid: string;
  /** @minLength 1 */
  x5u?: string;
  x5t?: string;
  "x5t#S256"?: string;
  x5c?: string[];
  crv?: string;
  x?: string;
  y?: string;
  d?: string;
  k?: string;
  n?: string;
  e?: string;
  p?: string;
  q?: string;
  dp?: string;
  dq?: string;
  qi?: string;
  /**
   * @minItems 1
   * @uniqueItems false
   */
  oth?: OtherPrimeInfo[];
}

/** OtherPrimeInfo */
export interface OtherPrimeInfo {
  r: string;
  d: string;
  t: string;
}

/** organization model */
export interface Organization {
  /**
   * internal organization identifier
   * @format uuid
   */
  id: string;
  /** organization identifier model */
  externalId: ExternalId;
  /** organization name */
  name: string;
  /** organization category (IPA category) */
  category: string;
}

/** external id origin */
export type Origin = string;

/** Purpose State */
export type PurposeState = "ACTIVE" | "DRAFT" | "SUSPENDED" | "WAITING_FOR_APPROVAL" | "ARCHIVED" | "REJECTED";

export interface Purpose {
  /** @format uuid */
  id: string;
  /** @format int32 */
  throughput: number;
  /** Purpose State */
  state: PurposeState;
}

export interface Purposes {
  purposes: Purpose[];
}

export type AttributeKind = "CERTIFIED" | "DECLARED" | "VERIFIED";

/**
 * Attribute
 * represents the details of a verified attribute bound to the agreement.
 */
export interface AttributeSeed {
  /**
   * source identifier
   * @minLength 2
   * @maxLength 16
   * @pattern ^[a-zA-Z0-9\-_]+$
   */
  code: string;
  /**
   * human readable name
   * @minLength 2
   * @maxLength 24
   * @pattern ^[a-zA-Z0-9\s\-_]+$
   */
  name: string;
  /**
   * human readable description
   * @minLength 2
   * @maxLength 64
   * @pattern ^[a-zA-Z0-9\s\-_\.,;\:]+$
   */
  description: string;
}

export type AttributeValidity = "VALID" | "INVALID";

/**
 * Attribute
 * represents the details of a verified attribute bound to the agreement.
 */
export interface Attribute {
  /** @format uuid */
  id: string;
  /**
   * @minLength 2
   * @maxLength 16
   * @pattern ^[a-zA-Z0-9\s\-_]+$
   */
  name: string;
  kind: AttributeKind;
}

export interface Attributes {
  /** @uniqueItems true */
  verified: AttributeValidityState[];
  /** @uniqueItems true */
  certified: AttributeValidityState[];
  /** @uniqueItems true */
  declared: AttributeValidityState[];
}

/**
 * AttributeValidityState
 * represents the validity of a specified attribute
 */
export interface AttributeValidityState {
  /** @format uuid */
  id: string;
  validity: AttributeValidity;
}

/** Agreement State */
export type AgreementState =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "ARCHIVED"
  | "MISSING_CERTIFIED_ATTRIBUTES"
  | "REJECTED";

/** business representation of an agreement */
export interface Agreement {
  /** @format uuid */
  id: string;
  /** @format uuid */
  eserviceId: string;
  /** @format uuid */
  descriptorId: string;
  /** @format uuid */
  producerId: string;
  /** @format uuid */
  consumerId: string;
  /** Agreement State */
  state: AgreementState;
}

export interface Agreements {
  agreements: Agreement[];
}

export interface Events {
  /** @format int64 */
  lastEventId?: number;
  events: Event[];
}

export interface Event {
  /** @format int64 */
  eventId: number;
  eventType: string;
  objectType: string;
  objectId: any;
}

export interface Pagination {
  /** @format int32 */
  offset: number;
  /** @format int32 */
  limit: number;
  /** @format int32 */
  totalCount: number;
}

export interface Problem {
  /** URI reference of type definition */
  type: string;
  /**
   * The HTTP status code generated by the origin server for this occurrence of the problem.
   * @format int32
   * @min 100
   * @max 600
   * @exclusiveMax true
   * @example 400
   */
  status: number;
  /**
   * A short, summary of the problem type. Written in english and readable
   * @maxLength 64
   * @pattern ^[ -~]{0,64}$
   * @example "Service Unavailable"
   */
  title: string;
  /**
   * Unique identifier of the request
   * @maxLength 64
   * @example "53af4f2d-0c87-41ef-a645-b726a821852b"
   */
  correlationId?: string;
  /**
   * A human readable explanation of the problem.
   * @maxLength 4096
   * @pattern ^.{0,1024}$
   * @example "Request took too long to complete."
   */
  detail?: string;
  /** @minItems 0 */
  errors: ProblemError[];
}

export interface ProblemError {
  /**
   * Internal code of the error
   * @minLength 8
   * @maxLength 8
   * @pattern ^[0-9]{3}-[0-9]{4}$
   * @example "123-4567"
   */
  code: string;
  /**
   * A human readable explanation specific to this occurrence of the problem.
   * @maxLength 4096
   * @pattern ^.{0,1024}$
   * @example "Parameter not valid"
   */
  detail: string;
}

export interface GetPurposesParams {
  /**
   * the eservice Id
   * @format uuid
   */
  eserviceId: string;
  /**
   * the consumer Id
   * @format uuid
   */
  consumerId: string;
}

export interface GetEServicesParams {
  /**
   * the maximum number of events returned by this response
   * @format int32
   * @min 1
   * @max 50
   */
  limit: number;
  /**
   * @format int32
   * @min 0
   */
  offset: number;
}

export interface GetAgreementsParams {
  /** @format uuid */
  producerId?: string;
  /** @format uuid */
  consumerId?: string;
  /** @format uuid */
  eserviceId?: string;
  /** @format uuid */
  descriptorId?: string;
  /**
   * comma separated sequence of agreement states to filter the response with
   * @default []
   */
  states?: AgreementState[];
}

export interface GetEventsFromIdParams {
  /**
   * last event identifier already processed by the caller
   * @format int64
   * @default 0
   */
  lastEventId: number;
  /**
   * the maximum number of events returned by this response
   * @format int32
   * @min 1
   * @max 500
   * @default 100
   */
  limit?: number;
}

export interface GetEservicesEventsFromIdParams {
  /**
   * last event identifier already processed by the caller
   * @format int64
   * @default 0
   */
  lastEventId: number;
  /**
   * the maximum number of events returned by this response
   * @format int32
   * @min 1
   * @max 500
   * @default 100
   */
  limit?: number;
}

export interface GetKeysEventsFromIdParams {
  /**
   * last event identifier already processed by the caller
   * @format int64
   * @default 0
   */
  lastEventId: number;
  /**
   * the maximum number of events returned by this response
   * @format int32
   * @min 1
   * @max 500
   * @default 100
   */
  limit?: number;
}

export interface GetOrganizationEServicesParams {
  /** attribute origin that the EService must contain */
  attributeOrigin: string;
  /** attribute code that the EService must contain */
  attributeCode: string;
  /** the origin identifier */
  origin: string;
  /** the externalId identifier */
  externalId: string;
}

export interface GetAgreementsEventsFromIdParams {
  /**
   * last event identifier already processed by the caller
   * @format int64
   * @default 0
   */
  lastEventId: number;
  /**
   * the maximum number of events returned by this response
   * @format int32
   * @min 1
   * @max 500
   * @default 100
   */
  limit?: number;
}

export namespace Agreements {
  /**
   * @description Retrieve an agreement using an agreement identifier
   * @tags gateway
   * @name GetAgreement
   * @summary Get an agreement
   * @request GET:/agreements/{agreementId}
   * @secure
   */
  export namespace GetAgreement {
    export type RequestParams = {
      /**
       * the agreement id
       * @format uuid
       */
      agreementId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Agreement;
  }
  /**
   * @description It is mandatory to insert either the producerId field or the consumerId field.
   * @tags gateway
   * @name GetAgreements
   * @summary Retrieve a list of agreement
   * @request GET:/agreements
   * @secure
   */
  export namespace GetAgreements {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @format uuid */
      producerId?: string;
      /** @format uuid */
      consumerId?: string;
      /** @format uuid */
      eserviceId?: string;
      /** @format uuid */
      descriptorId?: string;
      /**
       * comma separated sequence of agreement states to filter the response with
       * @default []
       */
      states?: AgreementState[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Agreements;
  }
  /**
   * @description Retrieve purposes of the agreement
   * @tags gateway
   * @name GetAgreementPurposes
   * @summary Get an purpose
   * @request GET:/agreements/{agreementId}/purposes
   * @secure
   */
  export namespace GetAgreementPurposes {
    export type RequestParams = {
      /**
       * the agreement identifier
       * @format uuid
       */
      agreementId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Purposes;
  }
  /**
   * @description Retrieve attributes of the agreement
   * @tags gateway
   * @name GetAgreementAttributes
   * @summary Get agreement attributes
   * @request GET:/agreements/{agreementId}/attributes
   * @secure
   */
  export namespace GetAgreementAttributes {
    export type RequestParams = {
      /**
       * the agreement identifier
       * @format uuid
       */
      agreementId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Attributes;
  }
}

export namespace Purposes {
  /**
   * @description Retrieve all the active purposes associated to eserviceId/consumerId
   * @tags gateway
   * @name GetPurposes
   * @summary Get purposes for eserviceId/consumerId
   * @request GET:/purposes
   * @secure
   */
  export namespace GetPurposes {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * the eservice Id
       * @format uuid
       */
      eserviceId: string;
      /**
       * the consumer Id
       * @format uuid
       */
      consumerId: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Purposes;
  }
  /**
   * @description Retrieve a purpose using a purpose identifier
   * @tags gateway
   * @name GetPurpose
   * @summary Get an purpose
   * @request GET:/purposes/{purposeId}
   * @secure
   */
  export namespace GetPurpose {
    export type RequestParams = {
      /**
       * the purpose Id
       * @format uuid
       */
      purposeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Purpose;
  }
  /**
   * @description Retrieve the agreement associated to a purpose
   * @tags gateway
   * @name GetAgreementByPurpose
   * @summary Get an agreement by purposeId
   * @request GET:/purposes/{purposeId}/agreement
   * @secure
   */
  export namespace GetAgreementByPurpose {
    export type RequestParams = {
      /**
       * the purpose Id
       * @format uuid
       */
      purposeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Agreement;
  }
}

export namespace Attributes {
  /**
   * @description Creates an attribute if the caller is a certifier
   * @tags gateway
   * @name CreateCertifiedAttribute
   * @summary Creates an attribute
   * @request POST:/attributes
   * @secure
   */
  export namespace CreateCertifiedAttribute {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AttributeSeed;
    export type RequestHeaders = {};
    export type ResponseBody = Attribute;
  }
  /**
   * @description Retrieve an attribute using an attribute identifier
   * @tags gateway
   * @name GetAttribute
   * @summary Get an attribute
   * @request GET:/attributes/{attributeId}
   * @secure
   */
  export namespace GetAttribute {
    export type RequestParams = {
      /**
       * the attribute Id
       * @format uuid
       */
      attributeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Attribute;
  }
}

export namespace Clients {
  /**
   * @description Retrieve a client using a client identifier
   * @tags gateway
   * @name GetClient
   * @summary Get a client
   * @request GET:/clients/{clientId}
   * @secure
   */
  export namespace GetClient {
    export type RequestParams = {
      /**
       * the client Id
       * @format uuid
       */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Client;
  }
}

export namespace Eservices {
  /**
   * @description Retrieves EServices catalog
   * @tags gateway
   * @name GetEServices
   * @summary Retrieves EServices catalog
   * @request GET:/eservices
   * @secure
   */
  export namespace GetEServices {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * the maximum number of events returned by this response
       * @format int32
       * @min 1
       * @max 50
       */
      limit: number;
      /**
       * @format int32
       * @min 0
       */
      offset: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CatalogEServices;
  }
  /**
   * @description Get the eservice by ID
   * @tags gateway
   * @name GetEService
   * @summary Get the eservice by ID
   * @request GET:/eservices/{eserviceId}
   * @secure
   */
  export namespace GetEService {
    export type RequestParams = {
      /** @format uuid */
      eserviceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = EService;
  }
  /**
   * @description Get the eservice descriptors by eservice ID
   * @tags gateway
   * @name GetEServiceDescriptors
   * @summary Get the eservice descriptors by eservice ID
   * @request GET:/eservices/{eserviceId}/descriptors
   * @secure
   */
  export namespace GetEServiceDescriptors {
    export type RequestParams = {
      /** @format uuid */
      eserviceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = EServiceDescriptors;
  }
  /**
   * @description Retrieve an eservice descriptor by identifiers
   * @tags gateway
   * @name GetEServiceDescriptor
   * @summary Get an eservice descriptor
   * @request GET:/eservices/{eserviceId}/descriptors/{descriptorId}
   * @secure
   */
  export namespace GetEServiceDescriptor {
    export type RequestParams = {
      /**
       * the eservice Id
       * @format uuid
       */
      eserviceId: string;
      /**
       * the eservice descriptor Id
       * @format uuid
       */
      descriptorId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = EServiceDescriptor;
  }
}

export namespace Organizations {
  /**
   * @description Retrieve an organization by identifier
   * @tags gateway
   * @name GetOrganization
   * @summary Get an organization
   * @request GET:/organizations/{organizationId}
   * @secure
   */
  export namespace GetOrganization {
    export type RequestParams = {
      /**
       * the organization Id
       * @format uuid
       */
      organizationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Organization;
  }
  /**
   * @description Upserts the Tenant
   * @tags gateway
   * @name UpsertTenant
   * @request POST:/organizations/origin/{origin}/externalId/{externalId}/attributes/{code}
   * @secure
   */
  export namespace UpsertTenant {
    export type RequestParams = {
      /** the origin identifier */
      origin: string;
      /** the externalId identifier */
      externalId: string;
      /** the attribute code identifier */
      code: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
  /**
   * @description Revokes a Tenant attribute
   * @tags gateway
   * @name RevokeTenantAttribute
   * @request DELETE:/organizations/origin/{origin}/externalId/{externalId}/attributes/{code}
   * @secure
   */
  export namespace RevokeTenantAttribute {
    export type RequestParams = {
      /** the origin identifier */
      origin: string;
      /** the externalId identifier */
      externalId: string;
      /** the attribute code identifier */
      code: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
  /**
   * @description Retrieve EServices for a given Organization
   * @tags gateway
   * @name GetOrganizationEServices
   * @request POST:/organizations/origin/{origin}/externalId/{externalId}/eservices
   * @secure
   */
  export namespace GetOrganizationEServices {
    export type RequestParams = {
      /** the origin identifier */
      origin: string;
      /** the externalId identifier */
      externalId: string;
    };
    export type RequestQuery = {
      /** attribute origin that the EService must contain */
      attributeOrigin: string;
      /** attribute code that the EService must contain */
      attributeCode: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = EServices;
  }
}

export namespace Events {
  /**
   * @description Retrieves the list of events for the caller's institution
   * @tags gateway
   * @name GetEventsFromId
   * @summary Get list of events
   * @request GET:/events
   * @secure
   */
  export namespace GetEventsFromId {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * last event identifier already processed by the caller
       * @format int64
       * @default 0
       */
      lastEventId: number;
      /**
       * the maximum number of events returned by this response
       * @format int32
       * @min 1
       * @max 500
       * @default 100
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Events;
  }
  /**
   * @description Retrieves the list of eservices events
   * @tags gateway
   * @name GetEservicesEventsFromId
   * @summary Get list of eservices events
   * @request GET:/events/eservices
   * @secure
   */
  export namespace GetEservicesEventsFromId {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * last event identifier already processed by the caller
       * @format int64
       * @default 0
       */
      lastEventId: number;
      /**
       * the maximum number of events returned by this response
       * @format int32
       * @min 1
       * @max 500
       * @default 100
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Events;
  }
  /**
   * @description Retrieves the list of keys events
   * @tags gateway
   * @name GetKeysEventsFromId
   * @summary Get list of keys events
   * @request GET:/events/keys
   * @secure
   */
  export namespace GetKeysEventsFromId {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * last event identifier already processed by the caller
       * @format int64
       * @default 0
       */
      lastEventId: number;
      /**
       * the maximum number of events returned by this response
       * @format int32
       * @min 1
       * @max 500
       * @default 100
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Events;
  }
  /**
   * @description Retrieves the list of agreements events
   * @tags gateway
   * @name GetAgreementsEventsFromId
   * @summary Get list of agreements events
   * @request GET:/events/agreements
   * @secure
   */
  export namespace GetAgreementsEventsFromId {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * last event identifier already processed by the caller
       * @format int64
       * @default 0
       */
      lastEventId: number;
      /**
       * the maximum number of events returned by this response
       * @format int32
       * @min 1
       * @max 500
       * @default 100
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Events;
  }
}

export namespace Keys {
  /**
   * @description Retrieve the JWK by kid
   * @tags gateway
   * @name GetJwkByKid
   * @summary Retrieve key in JWK format
   * @request GET:/keys/{kid}
   * @secure
   */
  export namespace GetJwkByKid {
    export type RequestParams = {
      /** the unique identifier of the key (kid) to lookup */
      kid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = JWK;
  }
}

export namespace Status {
  /**
   * @description Returns the application status. For testing purposes, it might randomly reply with an error.
   * @tags health
   * @name GetStatus
   * @summary Returns the application status
   * @request GET:/status
   */
  export namespace GetStatus {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Problem;
  }
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "{{baseUrl}}/{{version}}" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Interoperability API Gateway Micro Service
 * @version 1.0
 * @termsOfService http://swagger.io/terms/
 * @baseUrl {{baseUrl}}/{{version}}
 * @contact API Support <support@example.com> (http://www.example.com/support)
 *
 * exposes the API for interacting with interoperability features
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  agreements = {
    /**
     * @description Retrieve an agreement using an agreement identifier
     *
     * @tags gateway
     * @name GetAgreement
     * @summary Get an agreement
     * @request GET:/agreements/{agreementId}
     * @secure
     */
    getAgreement: (agreementId: string, params: RequestParams = {}) =>
      this.request<Agreement, Problem>({
        path: `/agreements/${agreementId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description It is mandatory to insert either the producerId field or the consumerId field.
     *
     * @tags gateway
     * @name GetAgreements
     * @summary Retrieve a list of agreement
     * @request GET:/agreements
     * @secure
     */
    getAgreements: (query: GetAgreementsParams, params: RequestParams = {}) =>
      this.request<Agreements, Problem>({
        path: `/agreements`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve purposes of the agreement
     *
     * @tags gateway
     * @name GetAgreementPurposes
     * @summary Get an purpose
     * @request GET:/agreements/{agreementId}/purposes
     * @secure
     */
    getAgreementPurposes: (agreementId: string, params: RequestParams = {}) =>
      this.request<Purposes, Problem>({
        path: `/agreements/${agreementId}/purposes`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve attributes of the agreement
     *
     * @tags gateway
     * @name GetAgreementAttributes
     * @summary Get agreement attributes
     * @request GET:/agreements/{agreementId}/attributes
     * @secure
     */
    getAgreementAttributes: (agreementId: string, params: RequestParams = {}) =>
      this.request<Attributes, Problem>({
        path: `/agreements/${agreementId}/attributes`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  purposes = {
    /**
     * @description Retrieve all the active purposes associated to eserviceId/consumerId
     *
     * @tags gateway
     * @name GetPurposes
     * @summary Get purposes for eserviceId/consumerId
     * @request GET:/purposes
     * @secure
     */
    getPurposes: (query: GetPurposesParams, params: RequestParams = {}) =>
      this.request<Purposes, Problem>({
        path: `/purposes`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a purpose using a purpose identifier
     *
     * @tags gateway
     * @name GetPurpose
     * @summary Get an purpose
     * @request GET:/purposes/{purposeId}
     * @secure
     */
    getPurpose: (purposeId: string, params: RequestParams = {}) =>
      this.request<Purpose, Problem>({
        path: `/purposes/${purposeId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve the agreement associated to a purpose
     *
     * @tags gateway
     * @name GetAgreementByPurpose
     * @summary Get an agreement by purposeId
     * @request GET:/purposes/{purposeId}/agreement
     * @secure
     */
    getAgreementByPurpose: (purposeId: string, params: RequestParams = {}) =>
      this.request<Agreement, Problem>({
        path: `/purposes/${purposeId}/agreement`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  attributes = {
    /**
     * @description Creates an attribute if the caller is a certifier
     *
     * @tags gateway
     * @name CreateCertifiedAttribute
     * @summary Creates an attribute
     * @request POST:/attributes
     * @secure
     */
    createCertifiedAttribute: (data: AttributeSeed, params: RequestParams = {}) =>
      this.request<Attribute, Problem>({
        path: `/attributes`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve an attribute using an attribute identifier
     *
     * @tags gateway
     * @name GetAttribute
     * @summary Get an attribute
     * @request GET:/attributes/{attributeId}
     * @secure
     */
    getAttribute: (attributeId: string, params: RequestParams = {}) =>
      this.request<Attribute, Problem>({
        path: `/attributes/${attributeId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  clients = {
    /**
     * @description Retrieve a client using a client identifier
     *
     * @tags gateway
     * @name GetClient
     * @summary Get a client
     * @request GET:/clients/{clientId}
     * @secure
     */
    getClient: (clientId: string, params: RequestParams = {}) =>
      this.request<Client, Problem>({
        path: `/clients/${clientId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  eservices = {
    /**
     * @description Retrieves EServices catalog
     *
     * @tags gateway
     * @name GetEServices
     * @summary Retrieves EServices catalog
     * @request GET:/eservices
     * @secure
     */
    getEServices: (query: GetEServicesParams, params: RequestParams = {}) =>
      this.request<CatalogEServices, Problem>({
        path: `/eservices`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the eservice by ID
     *
     * @tags gateway
     * @name GetEService
     * @summary Get the eservice by ID
     * @request GET:/eservices/{eserviceId}
     * @secure
     */
    getEService: (eserviceId: string, params: RequestParams = {}) =>
      this.request<EService, Problem>({
        path: `/eservices/${eserviceId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the eservice descriptors by eservice ID
     *
     * @tags gateway
     * @name GetEServiceDescriptors
     * @summary Get the eservice descriptors by eservice ID
     * @request GET:/eservices/{eserviceId}/descriptors
     * @secure
     */
    getEServiceDescriptors: (eserviceId: string, params: RequestParams = {}) =>
      this.request<EServiceDescriptors, Problem>({
        path: `/eservices/${eserviceId}/descriptors`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve an eservice descriptor by identifiers
     *
     * @tags gateway
     * @name GetEServiceDescriptor
     * @summary Get an eservice descriptor
     * @request GET:/eservices/{eserviceId}/descriptors/{descriptorId}
     * @secure
     */
    getEServiceDescriptor: (eserviceId: string, descriptorId: string, params: RequestParams = {}) =>
      this.request<EServiceDescriptor, Problem>({
        path: `/eservices/${eserviceId}/descriptors/${descriptorId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  organizations = {
    /**
     * @description Retrieve an organization by identifier
     *
     * @tags gateway
     * @name GetOrganization
     * @summary Get an organization
     * @request GET:/organizations/{organizationId}
     * @secure
     */
    getOrganization: (organizationId: string, params: RequestParams = {}) =>
      this.request<Organization, Problem>({
        path: `/organizations/${organizationId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Upserts the Tenant
     *
     * @tags gateway
     * @name UpsertTenant
     * @request POST:/organizations/origin/{origin}/externalId/{externalId}/attributes/{code}
     * @secure
     */
    upsertTenant: (origin: string, externalId: string, code: string, params: RequestParams = {}) =>
      this.request<void, Problem>({
        path: `/organizations/origin/${origin}/externalId/${externalId}/attributes/${code}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Revokes a Tenant attribute
     *
     * @tags gateway
     * @name RevokeTenantAttribute
     * @request DELETE:/organizations/origin/{origin}/externalId/{externalId}/attributes/{code}
     * @secure
     */
    revokeTenantAttribute: (origin: string, externalId: string, code: string, params: RequestParams = {}) =>
      this.request<void, Problem>({
        path: `/organizations/origin/${origin}/externalId/${externalId}/attributes/${code}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Retrieve EServices for a given Organization
     *
     * @tags gateway
     * @name GetOrganizationEServices
     * @request POST:/organizations/origin/{origin}/externalId/{externalId}/eservices
     * @secure
     */
    getOrganizationEServices: (
      { origin, externalId, ...query }: GetOrganizationEServicesParams,
      params: RequestParams = {},
    ) =>
      this.request<EServices, Problem>({
        path: `/organizations/origin/${origin}/externalId/${externalId}/eservices`,
        method: "POST",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  events = {
    /**
     * @description Retrieves the list of events for the caller's institution
     *
     * @tags gateway
     * @name GetEventsFromId
     * @summary Get list of events
     * @request GET:/events
     * @secure
     */
    getEventsFromId: (query: GetEventsFromIdParams, params: RequestParams = {}) =>
      this.request<Events, Problem>({
        path: `/events`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves the list of eservices events
     *
     * @tags gateway
     * @name GetEservicesEventsFromId
     * @summary Get list of eservices events
     * @request GET:/events/eservices
     * @secure
     */
    getEservicesEventsFromId: (query: GetEservicesEventsFromIdParams, params: RequestParams = {}) =>
      this.request<Events, Problem>({
        path: `/events/eservices`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves the list of keys events
     *
     * @tags gateway
     * @name GetKeysEventsFromId
     * @summary Get list of keys events
     * @request GET:/events/keys
     * @secure
     */
    getKeysEventsFromId: (query: GetKeysEventsFromIdParams, params: RequestParams = {}) =>
      this.request<Events, Problem>({
        path: `/events/keys`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves the list of agreements events
     *
     * @tags gateway
     * @name GetAgreementsEventsFromId
     * @summary Get list of agreements events
     * @request GET:/events/agreements
     * @secure
     */
    getAgreementsEventsFromId: (query: GetAgreementsEventsFromIdParams, params: RequestParams = {}) =>
      this.request<Events, Problem>({
        path: `/events/agreements`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  keys = {
    /**
     * @description Retrieve the JWK by kid
     *
     * @tags gateway
     * @name GetJwkByKid
     * @summary Retrieve key in JWK format
     * @request GET:/keys/{kid}
     * @secure
     */
    getJwkByKid: (kid: string, params: RequestParams = {}) =>
      this.request<JWK, Problem>({
        path: `/keys/${kid}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  status = {
    /**
     * @description Returns the application status. For testing purposes, it might randomly reply with an error.
     *
     * @tags health
     * @name GetStatus
     * @summary Returns the application status
     * @request GET:/status
     */
    getStatus: (params: RequestParams = {}) =>
      this.request<Problem, any>({
        path: `/status`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
