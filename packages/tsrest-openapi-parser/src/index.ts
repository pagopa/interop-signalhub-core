import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  RouteConfig,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import {
  AppRoute,
  AppRouteResponse,
  AppRouter,
  ContractAnyType,
  isZodType,
} from "@ts-rest/core";
import { z } from "zod";
import { InfoObject, OpenAPIObject, OperationObject } from "openapi3-ts";
import { RouteParameter } from "@asteasolutions/zod-to-openapi/dist/openapi-registry.js";

extendZodWithOpenApi(z);

type OpenAPIComponentTypeKey = Parameters<typeof registry.registerComponent>[0];
export type OpenAPICustomComponent = {
  type: OpenAPIComponentTypeKey;
  name: string;
  component: unknown;
};

type ResponseItems = RouteConfig["responses"];

type RouterPath = {
  id: string;
  path: string;
  route: AppRoute;
  paths: string[];
};

const mapMethod = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
  PATCH: "patch",
};
const registry = new OpenAPIRegistry();

const generateOpenAPIFromTsRestContract = (
  router: AppRouter,
  options: {
    setOperationId?: boolean | "concatenated-path";
    jsonQuery?: boolean;
    operationMapper?: (
      operation: OperationObject,
      appRoute: AppRoute
    ) => OperationObject;
  } = {}
): void => {
  const paths = getPathsFromRouter(router);

  const operationIds = new Map<string, string[]>();

  paths.forEach((path) => {
    // --- Check operationId ---
    if (options.setOperationId === true) {
      const existingOp = operationIds.get(path.id);
      if (existingOp) {
        throw new Error(
          `Route '${path.id}' already defined under ${existingOp.join(".")}`
        );
      }
      operationIds.set(path.id, path.paths);
    }
    // --- End check operationId ---

    const headers = getHeaders(path.route.headers);
    const responses = getResponses(path.route.responses);

    const body = path.route.method !== "GET" ? path.route.body : null;

    const routeConfigPath: RouteConfig = {
      description: path.route.description,
      deprecated: path.route.deprecated,
      summary: path.route.summary,

      method: mapMethod[path.route.method] as RouteConfig["method"],
      request: {
        body: body
          ? {
              content: {
                "application/json": {
                  schema: body as z.ZodType<unknown, z.ZodTypeDef, unknown>,
                },
              },
              description: "",
              required: true,
            }
          : undefined,
        headers,
        query: path.route.query as RouteParameter,
        params: path.route.pathParams as RouteParameter,
      },
      ...(options.setOperationId
        ? {
            operationId:
              options.setOperationId === "concatenated-path"
                ? [...path.paths, path.id].join(".")
                : path.id,
          }
        : {}),
      path: path.path,
      responses,
    };

    registry.registerPath(routeConfigPath);
  });
};
export function generateOpenAPISpec(
  router: AppRouter,
  apiDoc: Omit<OpenAPIObject, "paths" | "openapi"> & { info: InfoObject },
  options: {
    setOperationId?: boolean | "concatenated-path";
    jsonQuery?: boolean;
    operationMapper?: (
      operation: OperationObject,
      appRoute: AppRoute
    ) => OperationObject;
  } = {},
  customComponents: OpenAPICustomComponent[] = []
): OpenAPIObject {
  generateOpenAPIFromTsRestContract(router, options);

  // ---  registering custom components ----
  registerRowOpenAPIcomponents(customComponents);

  const generator = new OpenApiGeneratorV3(registry.definitions);

  const apiDocuments = generator.generateDocument({
    openapi: "3.0.3",
    ...apiDoc,
  });

  return apiDocuments as OpenAPIObject;
}

const registerRowOpenAPIcomponents = (
  components: OpenAPICustomComponent[] = []
): void => {
  components.forEach((component) => {
    registry.registerComponent(
      component.type,
      component.name,
      component.component
    );
  });
};
const getHeaders = (
  headers: ContractAnyType | undefined
): RouteParameter | undefined =>
  headers && Object.keys(headers).length === 0
    ? undefined
    : (headers as RouteParameter);

const getResponses = (
  responses: Record<number, AppRouteResponse>
): ResponseItems =>
  Object.entries(responses).reduce((acc, [statusCode, responseSchema]) => {
    const description =
      isZodType(responseSchema) && responseSchema.description
        ? responseSchema.description
        : statusCode;

    const httpSuccessCodePattern: RegExp = /^2[0-9]{2}$/;
    const isSuccess = httpSuccessCodePattern.test(statusCode);
    const keyMediaObject = isSuccess
      ? "application/json"
      : "application/problem+json";

    return {
      ...acc,
      [statusCode]: {
        description,
        ...(responseSchema
          ? {
              content: {
                [keyMediaObject]: {
                  schema: responseSchema,
                },
              },
            }
          : {}),
      },
    };
  }, {});

export const getPathsFromRouter = (
  router: AppRouter,
  pathHistory?: string[]
): RouterPath[] => {
  const paths: RouterPath[] = [];

  Object.keys(router).forEach((key) => {
    const value = router[key];

    if (isAppRoute(value)) {
      const pathWithPathParams = value.path.replace(/:(\w+)/g, "{$1}");

      // eslint-disable-next-line functional/immutable-data
      paths.push({
        id: key,
        path: pathWithPathParams,
        route: value,
        paths: pathHistory ?? [],
      });
    } else {
      // eslint-disable-next-line functional/immutable-data
      paths.push(...getPathsFromRouter(value, [...(pathHistory ?? []), key]));
    }
  });

  return paths;
};

/**
 * Differentiate between a route and a router
 *
 * @param obj
 * @returns
 */
export const isAppRoute = (obj: AppRoute | AppRouter): obj is AppRoute =>
  "method" in obj && "path" in obj;
