import { Button } from "@blueprintjs/core";
export const SignInWithGoogleButton = ({ text, onClick, loading }) => {
    return (
        <Button
            outlined
            loading={loading}
            icon={
                <img
                    style={{ height: 16 }}
                    className="bp3-icon"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                />
            }
            text={text}
            onClick={() => onClick()}
        />
    );
};
