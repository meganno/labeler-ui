import { useContext, useEffect, useState } from "react";
import { Base } from "./Base";
import {
    Navbar,
    NavbarGroup,
    NavbarHeading,
    H3,
    Alignment,
    ButtonGroup,
    Button,
    Tabs,
    Tab,
    Card,
    Intent,
} from "@blueprintjs/core";
import _ from "lodash";
import {
    ipy_function,
    MINIMUM_DASHBOARD_WIDGET_VIEW_HEIGHT,
    NAV_BAR_HEIGHT,
} from "./components/constant";
import { faIcon } from "./components/icon";
import { faPeopleGroup } from "@fortawesome/pro-duotone-svg-icons";
import { AnnotatorPanel } from "./components/dashboard/annotator/AnnotatorPanel";
import { OverviewPanel } from "./components/dashboard/overview/OverviewPanel";
import { ProjectionPanel } from "./components/dashboard/projection/ProjectionPanel";
import { DashboardContext } from "./components/context/DashboardContext";
import { LoadingScreen } from "./components/annotator/LoadingScreen";
import { actionToaster, createToast } from "./components/toaster";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
export const Dashboard = (payload) => {
    const { dashboardState, dashboardAction } = useContext(DashboardContext);
    const [tabId, setTabId] = useState(null);
    const [view, setView] = useState("aggregated");
    const [initStages, setInitStages] = useState([
        { text: "Fetching schemas" },
    ]);
    const isInitFinished = _.isEmpty(
        initStages.filter((stage) => !_.get(stage, "complete", false))
    );
    const completeStage = (stageIdx) => {
        var stageState = [...initStages];
        for (var i = 0; i < stageState.length; i++) {
            if (_.isEqual(i, stageIdx)) {
                _.set(stageState, [i, "complete"], true);
            }
        }
        setInitStages(stageState);
    };
    useEffect(() => {
        const service = payload.ipy_service;
        if (!_.isNil(service)) {
            const get_active_schemas_command = `${payload.ipy_service}.get_schemas().get_active_schemas()`;
            ipy_function(get_active_schemas_command)
                .then((schemas) => {
                    completeStage(0);
                    const active_schemas = _.get(
                        JSON.parse(schemas),
                        [0, "schemas", "label_schema"],
                        []
                    );
                    dashboardAction.setStateByKey({
                        key: "schemas",
                        value: active_schemas,
                    });
                    for (var i = 0; i < active_schemas.length; i++) {
                        if (_.isEqual(active_schemas[i].level, "record")) {
                            setTimeout(() => {
                                dashboardAction.setStateByKey({
                                    key: "focusLabel",
                                    value: active_schemas[i].name,
                                });
                            }, 0);
                            break;
                        }
                    }
                })
                .catch((error) => {
                    actionToaster.show(
                        createToast({
                            intent: Intent.DANGER,
                            action: {
                                text: "Copy code",
                                icon: faIcon({ icon: faPython }),
                                onClick: () => copy(get_active_schemas_command),
                            },
                            message: (
                                <div>
                                    Can't get active schemas; the operation
                                    couldn't be completed.
                                    <br />
                                    {error}
                                </div>
                            ),
                        })
                    );
                });
        }
        dashboardAction.setStateByKey({
            key: "ipy_interface",
            value: {
                service: service,
            },
        });
        setTabId("overview");
    }, []);
    const TAB_VIEWS = {
        annotator: <AnnotatorPanel />,
        overview: <OverviewPanel />,
        projection: <ProjectionPanel />,
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
                                Dashboard
                            </H3>
                        </NavbarHeading>
                    </NavbarGroup>
                    <NavbarGroup
                        style={{ height: NAV_BAR_HEIGHT }}
                        align={Alignment.RIGHT}
                    >
                        <ButtonGroup
                            minimal
                            className={!isInitFinished ? "bp3-skeleton" : null}
                        >
                            <Button
                                active={_.isEqual(view, "aggregated")}
                                onClick={() => setView("aggregated")}
                                text="Aggregated"
                                icon={faIcon({ icon: faPeopleGroup })}
                            />
                        </ButtonGroup>
                    </NavbarGroup>
                </Navbar>
                <div
                    style={{
                        height:
                            _.get(
                                payload.config,
                                "height",
                                MINIMUM_DASHBOARD_WIDGET_VIEW_HEIGHT
                            ) + 40,
                    }}
                >
                    {isInitFinished ? (
                        <div style={{ height: "100%" }}>
                            <Card
                                style={{
                                    padding: "5px 20px 0px",
                                    borderRadius: 0,
                                    display: "flex",
                                }}
                            >
                                <div>
                                    <Tabs
                                        onChange={(newTabId) =>
                                            setTabId(newTabId)
                                        }
                                        id="dashboard"
                                    >
                                        <Tab
                                            style={{ paddingBottom: 5 }}
                                            id="overview"
                                            title="Overview"
                                        />
                                        <Tab
                                            style={{ paddingBottom: 5 }}
                                            id="annotator"
                                            title="Annotator"
                                        />
                                        <Tab
                                            style={{ paddingBottom: 5 }}
                                            id="projection"
                                            title="Projection"
                                        />
                                    </Tabs>
                                </div>
                            </Card>
                            {_.isNil(
                                _.get(dashboardState, "ipy_interface.service")
                            ) ? null : (
                                <div
                                    key={`dashboard-tab-view-${tabId}`}
                                    style={{
                                        height: "calc(100% - 40px)",
                                    }}
                                >
                                    {_.get(TAB_VIEWS, tabId, null)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <LoadingScreen
                            title="Initializing dashboard widget..."
                            initStages={initStages}
                        />
                    )}
                </div>
            </Base>
        </div>
    );
};
