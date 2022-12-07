import {
    Navbar,
    NavbarGroup,
    H3,
    NavbarHeading,
    Alignment,
    Button,
    Card,
} from "@blueprintjs/core";
import { faFolders, faServer } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { Base } from "./Base";
import { NAV_BAR_HEIGHT } from "./components/constant";
import { ProjectManagerContext } from "./components/context/ProjectManagerContext";
import { faIcon } from "./components/icon";
import { ProjectInfo } from "./components/project/ProjectInfo";
import { ServerStatus } from "./components/project/ServerStatus";
export const ProjectManager = (payload) => {
    const { projectManagerState, projectManagerAction } = useContext(
        ProjectManagerContext
    );
    const [activeMenu, setActiveMenu] = useState("services");
    useEffect(() => {
        projectManagerAction.setStateByKey({
            key: "ipy_interface",
            value: {
                project: payload.ipy_project,
            },
        });
    }, []);
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
                                Project
                            </H3>
                        </NavbarHeading>
                    </NavbarGroup>
                    <NavbarGroup
                        style={{ height: NAV_BAR_HEIGHT }}
                        align={Alignment.RIGHT}
                    ></NavbarGroup>
                </Navbar>
                <div
                    style={{
                        padding: "20px 20px 10px 20px",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            minHeight: 195,
                            overflowY: "scroll",
                        }}
                    >
                        <Button
                            onClick={() => setActiveMenu("services")}
                            active={activeMenu === "services"}
                            minimal
                            style={{ marginBottom: 5 }}
                            text="Services"
                            icon={faIcon({ icon: faServer })}
                        />
                        <Button
                            onClick={() => setActiveMenu("projects")}
                            active={activeMenu === "projects"}
                            minimal
                            text="Projects"
                            icon={faIcon({ icon: faFolders })}
                        />
                        <Card
                            style={{
                                borderRadius: 0,
                                height: "100%",
                                position: "absolute",
                                right: 0,
                                top: 0,
                                padding: "20px 20px 10px 20px",
                                width: "calc(100% - 136.34px)",
                                overflowX: "hidden",
                            }}
                        >
                            {_.isNil(
                                _.get(
                                    projectManagerState,
                                    "ipy_interface.project"
                                )
                            ) ? null : (
                                <>
                                    {activeMenu === "services" ? (
                                        <ServerStatus />
                                    ) : null}
                                    {activeMenu === "projects" ? (
                                        <ProjectInfo />
                                    ) : null}
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </Base>
        </div>
    );
};
