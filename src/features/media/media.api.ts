import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/types";
import type { MediaObject } from "./types";

export const mediaApi = {
  upload: async (file: File): Promise<MediaObject> => {
    const form = new FormData();
    form.append("file", file);
    const response = await apiClient.post<ApiEnvelope<MediaObject>>(
      "/media",
      form,
      {
        transformRequest: [
          (data, headers) => {
            if (data instanceof FormData) {
              headers.delete("Content-Type");
            }
            return data;
          },
        ],
      },
    );
    return response.data.payload;
  },
};
