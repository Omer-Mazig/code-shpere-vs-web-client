import type { Blocker } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const SettingsLeaveDialog = ({ blocker }: { blocker: Blocker }) => (
  <AlertDialog
    open={blocker.state === "blocked"}
    onOpenChange={(open) => {
      if (!open && blocker.state === "blocked") {
        blocker.reset();
      }
    }}
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
        <AlertDialogDescription>
          You have unsaved settings. If you leave now, those changes will be
          lost.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          onClick={() => {
            if (blocker.state === "blocked") {
              blocker.reset();
            }
          }}
        >
          Stay
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={() => {
            if (blocker.state === "blocked") {
              blocker.proceed();
            }
          }}
        >
          Leave
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
