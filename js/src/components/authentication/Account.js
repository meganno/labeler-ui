import TimeAgo from "react-timeago";
import { FormGroup } from "@blueprintjs/core";
import { SignInWithGoogleButton } from "./SignInWithGoogleButton";
export const Account = ({ JWTPayload, signInWithGoogle, isLoading }) => {
    const JWTFormGroup = ({ label, children }) => {
        return (
            <FormGroup
                inline
                style={{ marginBottom: 0 }}
                label={
                    <div style={{ width: 70 }} className="bp3-text-muted">
                        {label}
                    </div>
                }
            >
                <div style={{ marginTop: 5, minWidth: 140 }}>{children}</div>
            </FormGroup>
        );
    };
    return (
        <div>
            <JWTFormGroup label="Email">
                {_.get(JWTPayload, "email", "-")}
            </JWTFormGroup>
            <JWTFormGroup label="Name">
                {_.get(JWTPayload, "name", "-")}
            </JWTFormGroup>
            <JWTFormGroup label="Expiration">
                {JWTPayload === null ? (
                    "-"
                ) : (
                    <TimeAgo
                        title={new Date(JWTPayload.exp * 1000).toLocaleString()}
                        date={new Date(JWTPayload.exp * 1000)}
                    />
                )}
            </JWTFormGroup>
            <div
                style={{
                    marginTop: 10,
                    display: "inline-block",
                }}
            >
                <SignInWithGoogleButton
                    loading={isLoading}
                    onClick={signInWithGoogle}
                    text={"Re-authenticate"}
                />
            </div>
        </div>
    );
};
