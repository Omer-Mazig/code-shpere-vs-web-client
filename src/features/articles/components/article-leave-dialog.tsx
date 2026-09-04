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
import { Button } from "@/components/ui/button";

type ArticleLeaveDialogProps = {
  blocker: Blocker;
  /** Published articles cannot be saved back to a draft, so they only get Discard. */
  canSaveDraft: boolean;
  isSaving: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
  onSaveDraft: () => void;
};

export const ArticleLeaveDialog = ({
  blocker,
  canSaveDraft,
  isSaving,
  onKeepEditing,
  onDiscard,
  onSaveDraft,
}: ArticleLeaveDialogProps) => (
  <AlertDialog
    open={blocker.state === "blocked"}
    onOpenChange={(open) => {
      if (!open && !isSaving) {
        onKeepEditing();
      }
    }}
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
        <AlertDialogDescription>
          {canSaveDraft
            ? "This article has changes you haven’t saved. Save them as a draft to pick them up later, or discard them."
            : "This published article has edits you haven’t saved. If you leave now they are lost — the live version stays as it is."}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isSaving} onClick={onKeepEditing}>
          Keep editing
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          disabled={isSaving}
          onClick={onDiscard}
        >
          Discard
        </AlertDialogAction>
        {canSaveDraft && (
          <Button type="button" disabled={isSaving} onClick={onSaveDraft}>
            {isSaving ? "Saving..." : "Save draft"}
          </Button>
        )}
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
