import { Button, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import { faPlus } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useState } from "react";
import copy from "copy-to-clipboard";
import { ipy_function } from "../constant";
import { ProjectManagerContext } from "../context/ProjectManagerContext";
import { faIcon } from "../icon";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import { actionToaster, createToast } from "../toaster";
import { StackResourceInfo } from "./StackResourceInfo";
import { Col, Row } from "react-grid-system";
export const ProjectInfo = () => {
    const { projectManagerState, projectManagerAction } = useContext(
        ProjectManagerContext
    );
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [nameError, setNameError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const onCreateProject = () => {
        setIsLoading(true);
        const matchResult = projectName.match(/^[a-zA-Z0-9_]*$/);
        if (_.isNull(matchResult) || !_.isEqual(matchResult[0], projectName)) {
            setIsLoading(false);
            setNameError(true);
        } else {
            const create_project_command = `${_.get(
                projectManagerState,
                "ipy_interface.project"
            )}.create_project(name="${projectName}")`;
            ipy_function(create_project_command)
                .then((result) => {
                    setIsLoading(false);
                    projectManagerAction.addStack(JSON.parse(result));
                    setNameError(false);
                    setProjectName("");
                    setIsProjectFormOpen(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                    setNameError(true);
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
                                        Can't create project; the operation
                                        couldn't be completed.
                                        <br />
                                        {error}
                                    </div>
                                </div>
                            ),
                        })
                    );
                });
        }
    };
    return (
        <div>
            {isProjectFormOpen ? (
                <div>
                    <FormGroup
                        label="Name"
                        labelInfo="(required)"
                        intent={nameError ? "danger" : null}
                        helperText="Up to 50 characters, and only from a-z, A-Z, 0-9, and underscore are allowed."
                    >
                        <InputGroup
                            intent={nameError ? "danger" : null}
                            maxLength={50}
                            style={{ maxWidth: 300 }}
                            autoFocus
                            onChange={(event) =>
                                setProjectName(_.trim(event.target.value))
                            }
                        />
                    </FormGroup>
                    <Button
                        loading={isLoading}
                        outlined
                        disabled={_.isEmpty(projectName)}
                        minimal
                        style={{ marginRight: 5 }}
                        intent="success"
                        onClick={onCreateProject}
                        text="Create project"
                    />
                    <Button
                        disabled={isLoading}
                        minimal
                        text="Cancel"
                        onClick={() => {
                            setIsProjectFormOpen(false);
                            setNameError(false);
                            setProjectName("");
                        }}
                    />
                </div>
            ) : (
                <div>
                    <Button
                        text="Create new project"
                        icon={faIcon({ icon: faPlus })}
                        minimal
                        outlined
                        style={{ marginBottom: 10 }}
                        onClick={() => setIsProjectFormOpen(true)}
                        intent="primary"
                    />
                    <Row gutterWidth={10}>
                        {projectManagerState.stackIds.map((stack_id, index) => (
                            <Col
                                md={12}
                                lg={6}
                                key={`project-project-info-stack-resource-info-${index}`}
                            >
                                <StackResourceInfo stackId={stack_id} />
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </div>
    );
};
