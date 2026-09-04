export const IMAGE_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const IMAGE_UPLOAD_ACCEPT = IMAGE_UPLOAD_MIME_TYPES.join(",");

export function isAcceptedImageFile(file: Pick<File, "type">) {
  return (IMAGE_UPLOAD_MIME_TYPES as readonly string[]).includes(file.type);
}
