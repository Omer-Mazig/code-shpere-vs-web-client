import React from "react";
import { ImagePlus, LayoutGrid, GalleryHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { IMAGE_UPLOAD_ACCEPT } from "@/features/media/media.constants";
import { useUploadMedia } from "@/features/media/hooks/use-upload-media";
import { getApiError } from "@/lib/errors";
import type { PostImage, PostImageLayout } from "../types";
import { MAX_POST_IMAGES } from "../posts.constants";

type PostImagePickerProps = {
  images: PostImage[];
  layout: PostImageLayout;
  disabled?: boolean;
  onImagesChange: (images: PostImage[]) => void;
  onLayoutChange: (layout: PostImageLayout) => void;
  onBusyChange?: (busy: boolean) => void;
};

export const PostImagePicker = ({
  images,
  layout,
  disabled,
  onImagesChange,
  onLayoutChange,
  onBusyChange,
}: PostImagePickerProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();
  const [uploadingCount, setUploadingCount] = React.useState(0);
  const busy = Boolean(disabled) || uploadingCount > 0;
  const remaining = MAX_POST_IMAGES - images.length;

  React.useEffect(() => {
    onBusyChange?.(uploadingCount > 0);
  }, [onBusyChange, uploadingCount]);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) {
      return;
    }

    if (remaining <= 0) {
      toast.error(`You can attach up to ${MAX_POST_IMAGES} images`);
      return;
    }

    const accepted = selected.slice(0, remaining);
    if (selected.length > remaining) {
      toast.error(`You can attach up to ${MAX_POST_IMAGES} images`);
    }

    setUploadingCount((count) => count + accepted.length);
    const uploaded: PostImage[] = [];
    try {
      for (const file of accepted) {
        try {
          const media = await uploadMedia.mutateAsync(file);
          uploaded.push({ id: media.id, url: media.url });
        } catch (error) {
          toast.error(getApiError(error).message ?? "Could not upload image");
        }
      }
      if (uploaded.length > 0) {
        onImagesChange([...images, ...uploaded]);
      }
    } finally {
      setUploadingCount((count) => count - accepted.length);
    }
  };

  return (
    <div className="space-y-2">
      {images.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={image.url}
                alt=""
                className="size-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                className="absolute top-1 right-1 size-6 rounded-full"
                disabled={busy}
                aria-label="Remove image"
                onClick={() =>
                  onImagesChange(images.filter((item) => item.id !== image.id))
                }
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_UPLOAD_ACCEPT}
          multiple
          className="sr-only"
          disabled={busy || remaining <= 0}
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || remaining <= 0}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus />
          {uploadingCount > 0 ? "Uploading..." : "Add images"}
        </Button>
        {images.length > 0 ? (
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            value={layout}
            onValueChange={(value) => {
              if (value === "GALLERY" || value === "CAROUSEL") {
                onLayoutChange(value);
              }
            }}
            disabled={busy}
            aria-label="Image layout"
          >
            <ToggleGroupItem
              value="GALLERY"
              aria-label="Gallery"
            >
              <LayoutGrid />
              Gallery
            </ToggleGroupItem>
            <ToggleGroupItem
              value="CAROUSEL"
              aria-label="Carousel"
            >
              <GalleryHorizontal />
              Carousel
            </ToggleGroupItem>
          </ToggleGroup>
        ) : null}
      </div>
    </div>
  );
};
