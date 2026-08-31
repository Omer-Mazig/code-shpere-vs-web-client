import { useMutation } from "@tanstack/react-query";
import { mediaApi } from "../media.api";

export function useUploadMedia() {
  return useMutation({
    mutationKey: ["media", "upload"],
    mutationFn: (file: File) => mediaApi.upload(file),
  });
}
