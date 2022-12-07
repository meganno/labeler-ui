import { Alert } from "@blueprintjs/core";
export const DeleteConfirmation = ({
    isOpen,
    deletionIds,
    confirmAction,
    cancelAction,
}) => {
    return (
        <Alert
            canEscapeKeyCancel
            canOutsideClickCancel
            onClose={cancelAction}
            isOpen={isOpen}
            cancelButtonText="Cancel"
            confirmButtonText={`Delete token${
                deletionIds.length > 1 ? "s" : ""
            }`}
            intent="danger"
            onCancel={cancelAction}
            onConfirm={() => confirmAction(deletionIds)}
        >
            Any applications or scripts using{" "}
            {deletionIds.length > 1 ? "these" : "this"} token
            {deletionIds.length > 1 ? "s" : ""} will no longer be able to access
            the labeler API. <br />
            You cannot undo this action.
        </Alert>
    );
};
