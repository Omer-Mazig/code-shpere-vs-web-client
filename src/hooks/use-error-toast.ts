import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useErrorToast(error: Error | null, suppress = false) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (error && !suppress && !shownRef.current) {
      shownRef.current = true;
      toast.error(error.message || "Something went wrong");
    }

    if (!error) {
      shownRef.current = false;
    }
  }, [error, suppress]);
}
