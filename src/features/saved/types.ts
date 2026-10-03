import type { components, operations } from "@/lib/api-types";

export type SavedItem = components["schemas"]["SavedItemResponseDto"];
export type SaveTargetDto = components["schemas"]["SaveTargetDto"];
export type SavedTargetType = components["schemas"]["SavedTargetType"];
export type SavedListQuery = NonNullable<
  operations["SavedController_list"]["parameters"]["query"]
>;
