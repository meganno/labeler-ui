import {
    Card,
    HTMLTable,
    Icon,
    IconSize,
    Intent,
    Tag,
} from "@blueprintjs/core";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { ipy_function } from "../constant";
import { ProjectManagerContext } from "../context/ProjectManagerContext";
import { faIcon } from "../icon";
import TimeAgo from "react-timeago";
import { actionToaster, createToast } from "../toaster";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import {
    faCircleQuestion,
    faSpinnerThird,
    faCheckCircle,
    faTriangleExclamation,
    faCloudCheck,
    faTrashClock,
    faTrashCheck,
    faClockRotateLeft,
} from "@fortawesome/pro-duotone-svg-icons";
export const StackResourceInfo = ({ stackId }) => {
    const { projectManagerState } = useContext(ProjectManagerContext);
    const [resources, setResources] = useState(null);
    const [stackStatus, setStackStatus] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const fetchResourceInfo = () => {
        const get_project_stack_status = `${_.get(
            projectManagerState,
            "ipy_interface.project"
        )}.get_project_stack_status(stack_id="${stackId}")`;
        ipy_function(get_project_stack_status)
            .then((result) => {
                const response = JSON.parse(result);
                setLastUpdate(new Date());
                setStackStatus(_.get(response, "stack_status", null));
                setResources(_.get(response, "resources", null));
                if (
                    _.endsWith(
                        _.get(response, "stack_status", null),
                        "_IN_PROGRESS"
                    )
                )
                    setTimeout(() => fetchResourceInfo(), 10000);
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () => copy(get_project_stack_status),
                        },
                        message: (
                            <div>
                                <div>
                                    Can't get project stack status; the
                                    operation couldn't be completed.
                                    <br />
                                    {error}
                                </div>
                            </div>
                        ),
                    })
                );
            });
    };
    useEffect(() => {
        fetchResourceInfo();
    }, []);
    const STACK_RESOURCE_UI_ATTRIBUTE = {
        CREATE_IN_PROGRESS: {
            intent: "primary",
            icon: faIcon({ icon: faSpinnerThird, className: "fa-spin" }),
        },
        CREATE_FAILED: {
            intent: "danger",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        CREATE_COMPLETE: {
            intent: "success",
            icon: faIcon({ icon: faCloudCheck }),
        },
        DELETE_IN_PROGRESS: {
            intent: "warning",
            icon: faIcon({ icon: faTrashClock }),
        },
        DELETE_FAILED: {
            intent: "danger",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        DELETE_COMPLETE: {
            intent: "warning",
            icon: faIcon({ icon: faTrashCheck }),
        },
        DELETE_SKIPPED: {
            intent: "warning",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        UPDATE_IN_PROGRESS: {
            intent: "primary",
            icon: faIcon({ icon: faSpinnerThird, className: "fa-spin" }),
        },
        UPDATE_FAILED: {
            intent: "danger",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        UPDATE_COMPLETE: {
            intent: "success",
            icon: faIcon({ icon: faCheckCircle }),
        },
        IMPORT_FAILED: {
            intent: "danger",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        IMPORT_COMPLETE: {
            intent: "success",
            icon: faIcon({ icon: faCheckCircle }),
        },
        IMPORT_IN_PROGRESS: {
            intent: "primary",
            icon: faIcon({ icon: faSpinnerThird, className: "fa-spin" }),
        },
        IMPORT_ROLLBACK_IN_PROGRESS: {
            intent: "warning",
            icon: faIcon({ icon: faClockRotateLeft }),
        },
        IMPORT_ROLLBACK_FAILED: {
            intent: "danger",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        IMPORT_ROLLBACK_COMPLETE: {
            intent: "warning",
            icon: faIcon({ icon: faCheckCircle }),
        },
        UPDATE_ROLLBACK_IN_PROGRESS: {
            intent: "warning",
            icon: faIcon({ icon: faClockRotateLeft }),
        },
        UPDATE_ROLLBACK_COMPLETE: {
            intent: "warning",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        UPDATE_ROLLBACK_FAILED: {
            intent: "danger",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        ROLLBACK_IN_PROGRESS: {
            intent: "primary",
            icon: faIcon({ icon: faClockRotateLeft }),
        },
        ROLLBACK_COMPLETE: {
            intent: "warning",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
        ROLLBACK_FAILED: {
            intent: "danger",
            icon: faIcon({ icon: faTriangleExclamation }),
        },
    };
    const STATUS_TAG_ICON = _.get(
        STACK_RESOURCE_UI_ATTRIBUTE,
        [stackStatus, "icon"],
        null
    );
    return (
        <Popover2
            className="full-parent-width"
            interactionKind="click"
            position="bottom"
            minimal
            content={
                <HTMLTable bordered condensed striped style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <th
                                colSpan={2}
                                style={{ borderBottom: "1px solid lightgray" }}
                            >
                                Project stack
                            </th>
                        </tr>
                        <tr>
                            <th>Resource</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!_.isNull(resources) ? (
                            _.isEmpty(resources) ? (
                                <td
                                    style={{ borderTop: "1px solid lightgray" }}
                                    colSpan={2}
                                >
                                    No resource
                                </td>
                            ) : (
                                resources.map((resource, index) => (
                                    <tr
                                        key={`project-stack-resource-info-row-${stackId}-${index}`}
                                    >
                                        <td>
                                            {resource.category} -{" "}
                                            {resource.type}
                                        </td>
                                        <td>{resource.status}</td>
                                    </tr>
                                ))
                            )
                        ) : null}
                        <tr>
                            {_.isNull(lastUpdate) ? (
                                <td
                                    colSpan={2}
                                    style={{ borderTop: "1px solid lightgray" }}
                                    className="bp3-skeleton"
                                >
                                    &nbsp;
                                </td>
                            ) : (
                                <td
                                    colSpan={2}
                                    style={{ borderTop: "1px solid lightgray" }}
                                >
                                    Updated <TimeAgo date={lastUpdate} />
                                </td>
                            )}
                        </tr>
                    </tbody>
                </HTMLTable>
            }
        >
            <Tooltip2
                usePortal={false}
                content="Click for more details"
                minimal
                position="bottom"
                className="full-parent-width"
            >
                <Card interactive style={{ padding: 5, marginBottom: 10 }}>
                    <div style={{ position: "relative" }}>
                        <div
                            className="bp3-text-overflow-ellipsis"
                            style={{
                                padding: 5,
                                maxWidth: "calc(100% - 127.73px)",
                            }}
                        >
                            <strong>
                                {_.get(
                                    projectManagerState,
                                    ["stackMap", stackId],
                                    "-"
                                )}
                            </strong>
                        </div>
                        <div
                            className={
                                _.isNull(stackStatus) ? "bp3-skeleton" : null
                            }
                            style={{
                                position: "absolute",
                                right: 4,
                                top: "50%",
                                maxWidth: 127.73,
                                transform: "translateY(-50%)",
                                msTransform: "translateY(-50%)",
                            }}
                        >
                            <Tag
                                style={{
                                    backgroundColor: "transparent",
                                    padding: 0,
                                    marginTop: 1,
                                    textAlign: "right",
                                }}
                                minimal
                                intent={_.get(
                                    STACK_RESOURCE_UI_ATTRIBUTE,
                                    [stackStatus, "intent"],
                                    null
                                )}
                            >
                                <Icon
                                    icon={
                                        _.isNull(STATUS_TAG_ICON)
                                            ? faIcon({
                                                  icon: faCircleQuestion,
                                                  size: 20,
                                              })
                                            : STATUS_TAG_ICON
                                    }
                                />
                            </Tag>
                        </div>
                    </div>
                </Card>
            </Tooltip2>
        </Popover2>
    );
};
