import type { components, operations } from "./api-types";

type EnvelopeBase =
  operations["AuthController_refresh"]["responses"][200]["content"]["application/json"];

type PaginatedPayloadBase =
  operations["PostsController_getFeed"]["responses"][200]["content"]["application/json"]["payload"];

export type ApiEnvelope<TPayload> = Omit<EnvelopeBase, "payload"> & {
  payload: TPayload;
};

export type PaginatedResponse<TItem> = Omit<PaginatedPayloadBase, "items"> & {
  items: TItem[];
};

export type ApiEnvelopeMeta = components["schemas"]["ApiEnvelopeMetaDto"];
export type ApiEnvelopeWarning = components["schemas"]["ApiEnvelopeWarningDto"];
export type PaginatedMeta = components["schemas"]["PaginatedMetaDto"];
export type ApiError = components["schemas"]["ApiErrorResponseDto"];
export type ValidationFieldError =
  components["schemas"]["ValidationFieldErrorDto"];
export type ErrorCode = ApiError["errorCode"];
