import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  RouteConfig,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
import { RouteParameter } from "@asteasolutions/zod-to-openapi/dist/openapi-registry.js";
import {
  AppRoute,
  AppRouteResponse,
  AppRouter,
  ContractAnyType,
  isZodType
} from "@ts-rest/core";
import { InfoObject, OpenAPIObject, OperationObject } from "openapi3-ts";
import { z } from "zod";

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
  PATCH: "patch"
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
  } = {},
  pathPrefix?: string
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

    const body =
      path.route.method === "POST" || path.route.method === "PUT"
        ? path.route.body
        : null;

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
                  schema: body as z.ZodType<unknown, z.ZodTypeDef, unknown>
                }
              },
              description: "",
              required: true
            }
          : undefined,
        headers,
        query: path.route.query as RouteParameter,
        params: path.route.pathParams as RouteParameter
      },
      ...(options.setOperationId
        ? {
            operationId:
              options.setOperationId === "concatenated-path"
                ? [...path.paths, path.id].join(".")
                : path.id
          }
        : {}),
      path: removePathprefixFromRoutePath(path.path, pathPrefix),
      responses
    };

    registry.registerPath(routeConfigPath);
  });
};

function removePathprefixFromRoutePath(
  routePath: string,
  pathPrefix?: string
): string {
  if (!pathPrefix) return routePath;

  if (routePath.includes(pathPrefix)) {
    return routePath.split(pathPrefix).join("");
  }
  return routePath;
}

// Example usage:

export function generateOpenAPISpec(
  router: AppRouter,
  apiDoc: { info: InfoObject } & Omit<OpenAPIObject, "paths" | "openapi">,
  options: {
    setOperationId?: boolean | "concatenated-path";
    jsonQuery?: boolean;
    operationMapper?: (
      operation: OperationObject,
      appRoute: AppRoute
    ) => OperationObject;
  } = {},
  customComponents: OpenAPICustomComponent[] = [],
  pathPrefix?: string
): OpenAPIObject {
  generateOpenAPIFromTsRestContract(router, options, pathPrefix);

  // ---  registering custom components ----
  registerRowOpenAPIcomponents(customComponents);

  const generator = new OpenApiGeneratorV3(registry.definitions);

  const apiDocuments = generator.generateDocument({
    openapi: "3.0.3",
    ...apiDoc
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

    const httpSuccessCodePattern = /^2[0-9]{2}$/;
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
                  schema: responseSchema
                }
              }
            }
          : {})
      }
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

      paths.push({
        id: key,
        path: pathWithPathParams,
        route: value,
        paths: pathHistory ?? []
      });
    } else {
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
