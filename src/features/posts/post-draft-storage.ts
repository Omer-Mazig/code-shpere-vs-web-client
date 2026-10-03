const POST_DRAFT_STORAGE_KEY = "codesphere:post-draft-id";

export function readPostDraftId(): string | null {
  return sessionStorage.getItem(POST_DRAFT_STORAGE_KEY);
}

export function rememberPostDraft(id: string) {
  sessionStorage.setItem(POST_DRAFT_STORAGE_KEY, id);
}

export function forgetPostDraft() {
  sessionStorage.removeItem(POST_DRAFT_STORAGE_KEY);
}
