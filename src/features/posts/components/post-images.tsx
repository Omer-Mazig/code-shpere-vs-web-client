import React from "react";
import type { PostImage, PostImageLayout } from "../types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type PostImagesProps = {
  images: PostImage[];
  layout: PostImageLayout;
  className?: string;
};

export const PostImages = ({ images, layout, className }: PostImagesProps) => {
  if (images.length === 0) {
    return null;
  }

  if (layout === "CAROUSEL" && images.length > 1) {
    return (
      <PostImageCarousel
        images={images}
        className={className}
      />
    );
  }

  return (
    <PostImageGallery
      images={images}
      className={className}
    />
  );
};

const PostImageGallery = ({
  images,
  className,
}: {
  images: PostImage[];
  className?: string;
}) => {
  if (images.length === 1) {
    return (
      <div className={cn("overflow-hidden rounded-xl", className)}>
        <img
          src={images[0].url}
          alt=""
          className="max-h-[28rem] w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-1 overflow-hidden rounded-xl",
        images.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
        className,
      )}
    >
      {images.map((image, index) => (
        <img
          key={image.id}
          src={image.url}
          alt=""
          className={cn(
            "h-40 w-full object-cover sm:h-48",
            images.length === 2 && "h-56 sm:h-64",
            images.length === 3 && index === 0 && "sm:row-span-2 sm:h-full",
          )}
        />
      ))}
    </div>
  );
};

const PostImageCarousel = ({
  images,
  className,
}: {
  images: PostImage[];
  className?: string;
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      className={cn("w-full", className)}
    >
      <CarouselContent className="-ml-0">
        {images.map((image) => (
          <CarouselItem
            key={image.id}
            className="pl-0"
          >
            <img
              src={image.url}
              alt=""
              className="max-h-[28rem] w-full rounded-xl object-cover"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 size-8 border-0 bg-background/80 disabled:hidden" />
      <CarouselNext className="right-2 size-8 border-0 bg-background/80 disabled:hidden" />
      <p className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-xs">
        {current + 1} / {images.length}
      </p>
    </Carousel>
  );
};
