import { Callout, Intent, Code, ProgressBar } from "@blueprintjs/core";
import { ContentCard } from "../ContentCard";
import { faCircleInfo, faPercent } from "@fortawesome/pro-duotone-svg-icons";
import { useContext, useEffect, useState } from "react";
import _ from "lodash";
import { faIcon } from "../../icon";
import { DashboardContext } from "../../context/DashboardContext";
import { ipy_function } from "../../constant";
import { actionToaster, createToast } from "../../toaster";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import classNames from "classnames";
export const Progress = () => {
    const { dashboardState } = useContext(DashboardContext);
    const [data, setData] = useState(null);
    useEffect(() => {
        const get_label_progress_command = `${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_label_progress()`;
        ipy_function(get_label_progress_command)
            .then((result) => {
                setData(JSON.parse(result));
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () => copy(get_label_progress_command),
                        },
                        message: (
                            <div>
                                <div>
                                    Can't get label progress data; the operation
                                    couldn't be completed.
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
        <ContentCard title="Overall Progress" icon={faPercent}>
            <div
                className={classNames({
                    "full-parent-width": true,
                    "bp3-skeleton": _.isNull(data),
                })}
            >
                <Callout icon={faIcon({ icon: faCircleInfo, size: 21 })}>
                    Annotated{" "}
                    <Code style={{ fontSize: "15px" }}>
                        {_.get(data, "annotated", null)}
                    </Code>{" "}
                    data points &#40;with at least 1 label&#41; out of{" "}
                    <Code style={{ fontSize: "15px" }}>
                        {_.get(data, "total", null)}
                    </Code>{" "}
                    total data points
                </Callout>
                {_.isNull(data) ? null : (
                    <div style={{ marginTop: 5 }}>
                        <ProgressBar
                            animate={false}
                            value={data.annotated / data.total}
                        />
                    </div>
                )}
            </div>
        </ContentCard>
    );
};
