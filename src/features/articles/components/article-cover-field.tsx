import React from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { IMAGE_UPLOAD_ACCEPT } from "@/features/media/media.constants";
import { useUploadMedia } from "@/features/media/hooks/use-upload-media";
import { getApiError } from "@/lib/errors";

type ArticleCoverFieldProps = {
  id: string;
  value: string;
  invalid: boolean;
  errors: React.ComponentProps<typeof FieldError>["errors"];
  disabled?: boolean;
  onChange: (url: string) => void;
  onBusyChange?: (busy: boolean) => void;
};

export const ArticleCoverField = ({
  id,
  value,
  invalid,
  errors,
  disabled,
  onChange,
  onBusyChange,
}: ArticleCoverFieldProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();
  const isUploading = uploadMedia.isPending;
  const busy = Boolean(disabled) || isUploading;

  React.useEffect(() => {
    onBusyChange?.(isUploading);
  }, [isUploading, onBusyChange]);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      const uploaded = await uploadMedia.mutateAsync(file);
      onChange(uploaded.url);
    } catch (error) {
      toast.error(getApiError(error).message ?? "Could not upload cover image");
    }
  };

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>Cover image (optional)</FieldLabel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="h-32 w-full overflow-hidden rounded-xl bg-muted sm:max-w-sm">
          {value ? (
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImagePlus className="size-6" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            className="sr-only"
            disabled={busy}
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? "Uploading..." : "Choose image"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onChange("")}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      <FieldDescription>
        Shown at the top of the article. JPEG, PNG, GIF, or WebP, up to 10MB.
      </FieldDescription>
      {invalid && <FieldError errors={errors} />}
    </Field>
  );
};
