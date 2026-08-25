/** Shared helper for TanStack Form + shadcn Field invalid state. */
export function isFieldInvalid(field: {
  state: { meta: { isTouched: boolean; isValid: boolean } };
}): boolean {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}
