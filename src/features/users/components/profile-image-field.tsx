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
import { UserAvatar } from "@/components/shared/user-avatar";
import { IMAGE_UPLOAD_ACCEPT } from "@/features/media/media.constants";
import { useUploadMedia } from "@/features/media/hooks/use-upload-media";
import { getApiError } from "@/lib/errors";

type ProfileImageFieldProps = {
  id: string;
  label: string;
  description: string;
  value: string;
  invalid: boolean;
  errors: React.ComponentProps<typeof FieldError>["errors"];
  preview: "avatar" | "cover";
  username: string;
  displayName?: string | null;
  disabled?: boolean;
  onChange: (url: string) => void;
};

export const ProfileImageField = ({
  id,
  label,
  description,
  value,
  invalid,
  errors,
  preview,
  username,
  displayName,
  disabled,
  onChange,
}: ProfileImageFieldProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();
  const isUploading = uploadMedia.isPending;
  const busy = Boolean(disabled) || isUploading;

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
      toast.error(getApiError(error).message ?? "Could not upload image.");
    }
  };

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {preview === "avatar" ? (
          <UserAvatar
            user={{ username, displayName, avatarUrl: value || null }}
            className="size-20 shrink-0"
          />
        ) : (
          <div className="h-24 w-full max-w-sm overflow-hidden rounded-lg bg-muted sm:w-56">
            {value ? (
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImagePlus className="size-6" />
              </div>
            )}
          </div>
        )}
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
      <FieldDescription>{description}</FieldDescription>
      {invalid && <FieldError errors={errors} />}
    </Field>
  );
};
