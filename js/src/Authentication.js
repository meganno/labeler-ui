import {
    Navbar,
    Button,
    NavbarGroup,
    NavbarHeading,
    H3,
    Card,
    Intent,
} from "@blueprintjs/core";
import { SignInWithGoogleButton } from "./components/authentication/SignInWithGoogleButton";
import { AuthenticationContext } from "./components/context/AuthenticationContext";
import { useContext, useEffect, useState } from "react";
import { NAV_BAR_HEIGHT } from "./components/constant";
import { Base } from "./Base";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { actionToaster, createToast } from "./components/toaster";
import { Base64 } from "js-base64";
import _ from "lodash";
import { faIcon } from "./components/icon";
import { faFingerprint, faIdBadge } from "@fortawesome/pro-duotone-svg-icons";
import { Account } from "./components/authentication/Account";
import { AccessToken } from "./components/authentication/AccessToken";
export const Authentication = ({ ipy_set_id_token, auth_varname }) => {
    const { authenticationAction } = useContext(AuthenticationContext);
    useEffect(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyDvr7chb86svObyDZXA7LYHHSMT2LRonNs",
            authDomain: "labeler-da2a3.firebaseapp.com",
            projectId: "labeler-da2a3",
            storageBucket: "labeler-da2a3.appspot.com",
            messagingSenderId: "621909423724",
            appId: "1:621909423724:web:73f1451bb274aa15970a49",
        };
        initializeApp(firebaseConfig);
        authenticationAction.setStateByKey({
            key: "ipySetIdToken",
            value: ipy_set_id_token,
        });
        authenticationAction.setStateByKey({
            key: "ipy_interface",
            value: {
                auth: auth_varname,
            },
        });
    }, []);
    const [activeMenu, setActiveMenu] = useState("account");
    const [JWTPayload, setJWTPayload] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const signInWithGoogle = () => {
        setIsLoading(true);
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential =
                    GoogleAuthProvider.credentialFromResult(result);
                authenticationAction.setUser(result.user);
                const jwtContent = result.user.accessToken.split(".");
                setTimeout(() => {
                    setJWTPayload(JSON.parse(Base64.decode(jwtContent[1])));
                    setIsLoading(false);
                }, 1000);
            })
            .catch((error) => {
                setIsLoading(false);
                setJWTPayload(null);
                authenticationAction.setUser(null);
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.email;
                const credential =
                    GoogleAuthProvider.credentialFromError(error);
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        message: `${
                            errorCode ? `[${errorCode}]` : ""
                        } ${errorMessage}`,
                    })
                );
            });
    };
    return (
        <div>
            <Base>
                <Navbar
                    style={{
                        height: NAV_BAR_HEIGHT,
                        paddingLeft: 20,
                        paddingRight: 20,
                    }}
                >
                    <NavbarGroup style={{ height: NAV_BAR_HEIGHT }}>
                        <NavbarHeading
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <H3 style={{ margin: 0, marginRight: 5 }}>
                                Authentication
                            </H3>
                        </NavbarHeading>
                    </NavbarGroup>
                </Navbar>
                <div style={{ padding: 20, position: "relative" }}>
                    {JWTPayload === null ? (
                        <SignInWithGoogleButton
                            loading={isLoading}
                            onClick={signInWithGoogle}
                            text={"Sign in with Google"}
                        />
                    ) : (
                        <div style={{ minHeight: 195 }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                }}
                            >
                                <Button
                                    minimal
                                    style={{ marginBottom: 5 }}
                                    active={activeMenu === "account"}
                                    text="Account"
                                    onClick={() => setActiveMenu("account")}
                                    icon={faIcon({ icon: faFingerprint })}
                                />
                                <Button
                                    minimal
                                    active={activeMenu === "tokens"}
                                    text="Tokens"
                                    onClick={() => setActiveMenu("tokens")}
                                    icon={faIcon({ icon: faIdBadge })}
                                />
                            </div>
                            <Card
                                style={{
                                    borderRadius: 0,
                                    height: "100%",
                                    position: "absolute",
                                    right: 0,
                                    top: 0,
                                    padding: 20,
                                    width: "calc(100% - 136.34px)",
                                    overflowX: "hidden",
                                }}
                            >
                                {activeMenu === "account" ? (
                                    <Account
                                        isLoading={isLoading}
                                        JWTPayload={JWTPayload}
                                        signInWithGoogle={signInWithGoogle}
                                    />
                                ) : null}
                                {activeMenu === "tokens" ? (
                                    <AccessToken />
                                ) : null}
                            </Card>
                        </div>
                    )}
                </div>
            </Base>
        </div>
    );
};
