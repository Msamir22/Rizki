/**
 * Delete Confirmation Modal
 *
 * Thin wrapper around `ConfirmationModal` with `variant="danger"`.
 * Preserves the legacy API (accepts `count` and computes title + message).
 */

import React from "react";
import { ConfirmationModal } from "./ConfirmationModal";

interface DeleteConfirmationModalProps {
  readonly visible: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly count: number;
}

export function DeleteConfirmationModal({
  visible,
  onConfirm,
  onCancel,
  count,
}: DeleteConfirmationModalProps): React.JSX.Element {
  const isPlural = count > 1;
  const noun = isPlural ? "Transactions" : "Transaction";

  return (
    <ConfirmationModal
      visible={visible}
      onConfirm={onConfirm}
      onCancel={onCancel}
      variant="danger"
      title={`Delete ${noun}?`}
      message={
        isPlural
          ? `This will delete ${count} transactions and revert all associated changes to account balances. This action cannot be undone.`
          : "This will delete the transaction and revert all associated changes to account balances. This action cannot be undone."
      }
      confirmLabel="Delete"
    />
  );
}
