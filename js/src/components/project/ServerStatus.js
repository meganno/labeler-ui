import { Intent, Card, Tag, Callout } from "@blueprintjs/core";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import { useContext, useEffect, useState } from "react";
import { ipy_function } from "../constant";
import { ProjectManagerContext } from "../context/ProjectManagerContext";
import { faIcon } from "../icon";
import { actionToaster, createToast } from "../toaster";
import { Row, Col } from "react-grid-system";
import _ from "lodash";
import { faMegaphone } from "@fortawesome/pro-duotone-svg-icons";
export const ServerStatus = () => {
    const { projectManagerState, projectManagerAction } = useContext(
        ProjectManagerContext
    );
    const [projects, setProjects] = useState(null);
    const updateServerStatus = () => {
        const keys = Object.keys(projects);
        for (var i = 0; i < keys.length; i++) {
            const project = keys[i];
            fetch(projects[project].REST_API)
                .then((response) => {
                    projectManagerAction.setServerStatus({
                        path: `${project}.REST_API`,
                        value: response.status,
                    });
                })
                .catch(() => {
                    projectManagerAction.setServerStatus({
                        path: `${project}.REST_API`,
                        value: 503,
                    });
                });
        }
    };
    useEffect(() => {
        if (_.isNull(projects)) return;
        updateServerStatus();
    }, [projects]);
    useEffect(() => {
        const get_projects_command = `${_.get(
            projectManagerState,
            "ipy_interface.project"
        )}.get_projects()`;
        ipy_function(get_projects_command)
            .then((result) => {
                setProjects(JSON.parse(result));
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () => copy(get_projects_command),
                        },
                        message: (
                            <div>
                                <div>
                                    Can't get projects; the operation couldn't
                                    be completed.
                                    <br />
                                    {error}
                                </div>
                            </div>
                        ),
                    })
                );
            });
    }, []);
    return (
        <div>
            <Callout
                style={{ marginBottom: 10 }}
                intent="primary"
                icon={faIcon({ icon: faMegaphone })}
            >
                If your project service is down or not showing, contact your
                labeler administrator.
            </Callout>
            {_.isNull(projects) ? (
                <div style={{ lineHeight: "40px" }} className="bp3-skeleton">
                    &nbsp;
                </div>
            ) : (
                <div>
                    <Row gutterWidth={10}>
                        {Object.keys(projects).map((key) => {
                            return (
                                <Col
                                    md={12}
                                    lg={6}
                                    key={`project-server-status-${key}`}
                                >
                                    <Card
                                        style={{
                                            padding: 5,
                                            overflow: "hidden",
                                            marginBottom: 10,
                                        }}
                                    >
                                        <div
                                            className="bp3-text-overflow-ellipsis"
                                            style={{
                                                padding: 5,
                                                maxWidth:
                                                    "calc(100% - 82.46px)",
                                                position: "relative",
                                            }}
                                        >
                                            <strong>{key}</strong>
                                        </div>
                                        <div
                                            style={{
                                                position: "absolute",
                                                right: 15,
                                                top: 10,
                                            }}
                                        >
                                            {["REST_API"].map((type) => {
                                                const statusCode = _.get(
                                                    projectManagerState,
                                                    ["serverStatus", key, type],
                                                    null
                                                );
                                                const tagIntent = _.isNull(
                                                    statusCode
                                                )
                                                    ? null
                                                    : _.isEqual(statusCode, 200)
                                                    ? "success"
                                                    : "danger";
                                                return (
                                                    <Tag
                                                        key={`project-server-status-type-${type}-${key}`}
                                                        style={{
                                                            marginLeft: 5,
                                                        }}
                                                        minimal
                                                        intent={tagIntent}
                                                    >
                                                        {type}
                                                    </Tag>
                                                );
                                            })}
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            )}
        </div>
    );
};
