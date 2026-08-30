import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeactivateAccountSettingsProps = {
  disabled?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
};

export const DeactivateAccountSettings = ({
  disabled = false,
  isPending = false,
  onConfirm,
}: DeactivateAccountSettingsProps) => (
  <section className="space-y-4 rounded-lg border border-destructive/30 p-4">
    <div className="flex items-center gap-2">
      <TriangleAlert className="h-4 w-4 text-destructive" />
      <h2 className="font-medium">Danger zone</h2>
    </div>
    <p className="text-sm text-muted-foreground">
      Deactivating hides your profile and content. Signing in again will
      reactivate your account.
    </p>

    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          disabled={disabled || isPending}
        >
          {isPending ? "Deactivating..." : "Deactivate account"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your profile and content will be hidden. Other devices will be
            signed out. You can reactivate by signing in with the same
            credentials.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
);
