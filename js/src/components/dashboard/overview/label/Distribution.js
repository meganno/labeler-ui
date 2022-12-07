import { ContentCard } from "../../ContentCard";
import { faChartPie, faCircleInfo } from "@fortawesome/pro-duotone-svg-icons";
import { Callout, Intent } from "@blueprintjs/core";
import { faIcon } from "../../../icon";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { VegaLite } from "react-vega";
import * as jsonSpec from "../../../vega/radial-plot.json";
import { DEFAULT_LEGEND_COLOR_PALETTE } from "../../../vega/constant";
import { ipy_function } from "../../../constant";
import { DashboardContext } from "../../../context/DashboardContext";
import { actionToaster, createToast } from "../../../toaster";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import { LabelClassSelect } from "../../LabelClassSelect";
export const Distribution = () => {
    const { dashboardState } = useContext(DashboardContext);
    const [spec, setSpec] = useState(jsonSpec);
    const focusLabel = _.get(dashboardState, "focusLabel", "");
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        var tempSpec = { ...spec };
        _.set(tempSpec, "scales.1.range", DEFAULT_LEGEND_COLOR_PALETTE);
        setSpec(tempSpec);
    }, []);
    useEffect(() => {
        if (_.isNil(focusLabel) || _.isEmpty(focusLabel)) return;
        setIsLoading(true);
        const get_label_distributions_command = `${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_label_distributions(label_name='${focusLabel}')`;
        ipy_function(get_label_distributions_command)
            .then((result) => {
                var tempSpec = { ...spec };
                const distribution = JSON.parse(result);
                _.set(tempSpec, "data", {
                    name: "source",
                    values: Object.keys(distribution).map((key) => ({
                        label: key,
                        total: distribution[key],
                    })),
                    transform: [{ type: "pie", field: "total" }],
                });
                setIsLoading(false);
                setSpec(tempSpec);
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () =>
                                copy(get_label_distributions_command),
                        },
                        message: (
                            <div>
                                <div>
                                    Can't get label distributions data; the
                                    operation couldn't be completed.
                                    <br />
                                    {error}
                                </div>
                            </div>
                        ),
                    })
                );
            });
    }, [focusLabel]);
    return (
        <ContentCard title="Class Label - Distributions" icon={faChartPie}>
            <Callout
                icon={faIcon({ icon: faCircleInfo, size: 21 })}
                style={{ marginBottom: 10 }}
            >
                Label class distribution for <LabelClassSelect /> subtask:
                aggregated over annotators' votes using
                &#123;majority_vote&#125;. <br />
                When there is a tie in the voting, they are categorized under
                "tied_annotations" class label.
            </Callout>
            {isLoading ? (
                <div className="bp3-skeleton full-parent-width">&nbsp;</div>
            ) : (
                <VegaLite spec={spec} />
            )}
        </ContentCard>
    );
};
