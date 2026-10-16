"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/lib/action-utils";
import { Alert } from "./Alert";

export function ActionForm({
  action,
  children,
  className = "",
  resetOnSuccess = false,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && resetOnSuccess) {
      ref.current?.reset();
    }
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {state?.error && (
        <div className="mb-4">
          <Alert kind="error">{state.error}</Alert>
        </div>
      )}
      {state?.success && (
        <div className="mb-4">
          <Alert kind="success">{state.success}</Alert>
        </div>
      )}
      {children}
    </form>
  );
}
