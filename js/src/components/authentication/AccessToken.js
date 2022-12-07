import {
    Button,
    Card,
    FormGroup,
    HTMLSelect,
    InputGroup,
    Intent,
    Tag,
} from "@blueprintjs/core";
import { faIcon } from "../icon";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import {
    faCalendarXmark,
    faCheck,
    faExclamationTriangle,
    faPlus,
} from "@fortawesome/pro-duotone-svg-icons";
import copy from "copy-to-clipboard";
import TimeAgo from "react-timeago";
import { useContext, useState } from "react";
import _ from "lodash";
import { ipy_function } from "../constant";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { actionToaster, createToast } from "../toaster";
import { Tooltip2 } from "@blueprintjs/popover2";
import { DeleteConfirmation } from "./DeleteConfirmation";
import classNames from "classnames";
import { Col, Row } from "react-grid-system";
export const AccessToken = () => {
    const { authenticationState } = useContext(AuthenticationContext);
    const [isTokenFormOpen, setIsTokenFormOpen] = useState(false);
    const [tokenNote, setTokenNote] = useState("");
    const [expirationDuration, setExpirationDuration] = useState(14);
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingToken, setIsGeneratingToken] = useState(false);
    const [deletionIds, setDeletionIds] = useState([]);
    useState(() => {
        const get_access_tokens = `${_.get(
            authenticationState,
            "ipy_interface.auth"
        )}.get_access_tokens()`;
        ipy_function(get_access_tokens)
            .then((result) => {
                setTokens(JSON.parse(result));
                setIsLoading(false);
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () => copy(get_access_tokens),
                        },
                        message: (
                            <div>
                                Can't get access tokens; the operation couldn't
                                be completed.
                                <br />
                                {error}
                            </div>
                        ),
                    })
                );
                setTokens([]);
                setIsLoading(false);
            });
    }, []);
    const onTokenFormClose = () => {
        setTokenNote("");
        setExpirationDuration(14);
        setIsTokenFormOpen(false);
        setIsGeneratingToken(false);
    };
    const deleteTokens = (tokenIds) => {
        const delete_access_token = `${_.get(
            authenticationState,
            "ipy_interface.auth"
        )}.delete_access_tokens(id_list=json.loads('${JSON.stringify(
            tokenIds
        )}'))`;
        ipy_function(delete_access_token)
            .then((result) => {
                const deletedIds = new Set(JSON.parse(result));
                var newTokens = tokens.filter(
                    (token) => !deletedIds.has(token.id)
                );
                setDeletionIds([]);
                setTokens(newTokens);
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () => copy(delete_access_token),
                        },
                        message: (
                            <div>
                                Can't delete access tokens; the operation
                                couldn't be completed.
                                <br />
                                {error}
                            </div>
                        ),
                    })
                );
                setDeletionIds([]);
            });
    };
    const generateToken = () => {
        setIsGeneratingToken(true);
        const create_access_token = `${_.get(
            authenticationState,
            "ipy_interface.auth"
        )}.create_access_token(note='${tokenNote.replace(
            "'",
            "\\'"
        )}', expiration_duration=${expirationDuration})`;
        ipy_function(create_access_token)
            .then((result) => {
                const token = JSON.parse(result);
                const newTokenList = [token, ...tokens];
                setTokens(newTokenList);
                onTokenFormClose();
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () => copy(create_access_token),
                        },
                        message: (
                            <div>
                                Can't create access token; the operation
                                couldn't be completed.
                                <br />
                                {error}
                            </div>
                        ),
                    })
                );
                setIsGeneratingToken(false);
            });
    };
    const GenerateTokenButton = () => (
        <Button
            intent="primary"
            minimal
            icon={faIcon({ icon: faPlus })}
            outlined
            text="Generate new token"
            onClick={() => setIsTokenFormOpen(true)}
        />
    );
    return (
        <div className="full-parent-height">
            <DeleteConfirmation
                isOpen={!_.isEmpty(deletionIds)}
                deletionIds={deletionIds}
                confirmAction={deleteTokens}
                cancelAction={() => setDeletionIds([])}
            />
            {isTokenFormOpen ? (
                <div>
                    <FormGroup
                        label="Note"
                        labelInfo="(optional)"
                        helperText="What’s this token for?"
                    >
                        <InputGroup
                            autoFocus
                            disabled={isGeneratingToken}
                            style={{ maxWidth: 300 }}
                            value={tokenNote}
                            onChange={(event) =>
                                setTokenNote(event.target.value)
                            }
                        />
                    </FormGroup>
                    <FormGroup inline label="Expiration">
                        <HTMLSelect
                            disabled={isGeneratingToken}
                            minimal
                            onChange={(event) =>
                                setExpirationDuration(event.currentTarget.value)
                            }
                            value={expirationDuration}
                        >
                            <option value={14}>14 days</option>
                            <option value={0}>No expiration</option>
                        </HTMLSelect>
                    </FormGroup>
                    <Button
                        loading={isGeneratingToken}
                        intent="success"
                        onClick={generateToken}
                        minimal
                        style={{ marginRight: 5 }}
                        outlined
                        text="Generate token"
                    />
                    <Button
                        disabled={isGeneratingToken}
                        minimal
                        text="Cancel"
                        onClick={onTokenFormClose}
                    />
                </div>
            ) : (
                <div className="full-parent-height">
                    {_.isEmpty(tokens) && !isLoading ? (
                        <div>
                            <GenerateTokenButton />
                            <div
                                style={{ marginTop: 10 }}
                                className={isLoading ? "bp3-skeleton" : null}
                            >
                                No valid access tokens are currently under your
                                account.
                            </div>
                        </div>
                    ) : (
                        <div>
                            <GenerateTokenButton />
                            <Button
                                className={isLoading ? "bp3-skeleton" : null}
                                style={{ marginLeft: 5 }}
                                minimal
                                outlined
                                intent="danger"
                                text="Revoke all"
                                onClick={() => {
                                    var ids = [];
                                    for (var i = 0; i < tokens.length; i++) {
                                        ids.push(tokens[i].id);
                                    }
                                    setDeletionIds(ids);
                                }}
                            />
                            <div style={{ marginTop: 10 }}>
                                Tokens you have generated that can be used to
                                access the labeler service.
                            </div>
                            {_.isEmpty(tokens) ? (
                                <div
                                    className="bp3-skeleton"
                                    style={{
                                        lineHeight: "53px",
                                        marginTop: 10,
                                    }}
                                >
                                    &nbsp;
                                </div>
                            ) : (
                                <Row gutterWidth={10}>
                                    {tokens.map((token) => {
                                        const tokenValue = _.get(
                                            token,
                                            "token",
                                            null
                                        );
                                        const isExpired =
                                            new Date(
                                                token.expires_on
                                            ).getTime() -
                                                new Date().getTime() <
                                            0;
                                        if (!_.isNull(tokenValue))
                                            return (
                                                <Col xs={12} key={token.id}>
                                                    <Tooltip2
                                                        className="full-parent-width"
                                                        content="Copy to clipboard"
                                                        position="bottom-left"
                                                        minimal
                                                    >
                                                        <Tag
                                                            icon={faIcon({
                                                                icon: faCheck,
                                                            })}
                                                            large
                                                            style={{
                                                                marginTop: 10,
                                                            }}
                                                            minimal
                                                            intent="success"
                                                            interactive
                                                            onClick={() =>
                                                                copy(tokenValue)
                                                            }
                                                        >
                                                            {tokenValue}
                                                        </Tag>
                                                    </Tooltip2>
                                                </Col>
                                            );
                                        return (
                                            <Col md={12} lg={6} key={token.id}>
                                                <Card
                                                    style={{
                                                        marginTop: 10,
                                                        padding: 5,
                                                        paddingLeft: 10,
                                                        paddingRight: 10,
                                                        position: "relative",
                                                        backgroundColor:
                                                            isExpired
                                                                ? "#F5F8FA"
                                                                : null,
                                                    }}
                                                >
                                                    <div>
                                                        {_.isEmpty(token.note)
                                                            ? "-"
                                                            : token.note}
                                                    </div>
                                                    <Button
                                                        outlined
                                                        intent="danger"
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            top: 10,
                                                            right: 10,
                                                        }}
                                                        onClick={() =>
                                                            setDeletionIds([
                                                                token.id,
                                                            ])
                                                        }
                                                        text="Delete"
                                                    />
                                                    {isExpired ? (
                                                        <Tag
                                                            minimal
                                                            style={{
                                                                backgroundColor:
                                                                    "transparent",
                                                                padding: 0,
                                                            }}
                                                            intent="danger"
                                                            icon={faIcon({
                                                                icon: faCalendarXmark,
                                                            })}
                                                        >
                                                            This token has
                                                            already expired.
                                                        </Tag>
                                                    ) : token.has_expiration ? (
                                                        <div className="bp3-text-muted bp3-text-small">
                                                            Expires{" "}
                                                            <TimeAgo
                                                                date={
                                                                    new Date(
                                                                        token.expires_on
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Tag
                                                            minimal
                                                            style={{
                                                                backgroundColor:
                                                                    "transparent",
                                                                padding: 0,
                                                            }}
                                                            intent="warning"
                                                            icon={faIcon({
                                                                icon: faExclamationTriangle,
                                                            })}
                                                        >
                                                            This token has no
                                                            expiration date
                                                        </Tag>
                                                    )}
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            )}
                            <div
                                className={classNames({
                                    "bp3-text-muted": true,
                                })}
                                style={{ paddingBottom: 20, marginTop: 10 }}
                            >
                                Access tokens function like Google ID tokens.
                                They can be used instead to give you longer
                                expiration duration.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
