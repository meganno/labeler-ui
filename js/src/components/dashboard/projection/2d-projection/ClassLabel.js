import { ContentCard } from "../../ContentCard";
import {
    faChartScatter,
    faInfoCircle,
} from "@fortawesome/pro-duotone-svg-icons";
import { useContext, useEffect, useState } from "react";
import * as jsonSpec from "../../../vega/scatter-plot.json";
import _ from "lodash";
import { VegaLite } from "react-vega";
import { DEFAULT_LEGEND_COLOR_PALETTE } from "../../../vega/constant";
import { Callout, Intent } from "@blueprintjs/core";
import { faIcon } from "../../../icon";
import { ipy_function } from "../../../constant";
import { actionToaster, createToast } from "../../../toaster";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import { DashboardContext } from "../../../context/DashboardContext";
import { LabelClassSelect } from "../../LabelClassSelect";
export const ClassLabel = () => {
    const { dashboardState } = useContext(DashboardContext);
    const [spec, setSpec] = useState(jsonSpec);
    const focusLabel = _.get(dashboardState, "focusLabel", "");
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        var tempSpec = { ...spec };
        _.set(tempSpec, "scales.2.range", DEFAULT_LEGEND_COLOR_PALETTE);
        setSpec(tempSpec);
    }, []);
    useEffect(() => {
        if (_.isNil(focusLabel) || _.isEmpty(focusLabel)) return;
        setIsLoading(true);
        const get_embeddings_command = `${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_embeddings(label_name='${focusLabel}', embed_type='bert-embedding')`;
        ipy_function(get_embeddings_command)
            .then((result) => {
                const embedding_result = JSON.parse(result);
                var tempSpec = { ...spec };
                _.set(tempSpec, "data", [
                    {
                        name: "source",
                        values: embedding_result.map((point) => ({
                            x: point.x_axis,
                            y: point.y_axis,
                            label: point.agg_label,
                        })),
                    },
                ]);
                setSpec(tempSpec);
                setIsLoading(false);
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () => copy(get_embeddings_command),
                        },
                        message: (
                            <div>
                                <div>
                                    Can't get embeddings data; the operation
                                    couldn't be completed.
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
        <ContentCard
            title="Class label (in 2D embedding space)"
            icon={faChartScatter}
        >
            <Callout
                style={{ marginBottom: 10 }}
                icon={faIcon({ icon: faInfoCircle, size: 21 })}
            >
                Label class visulization for <LabelClassSelect /> subtask in 2D
                embedding space. Coordinates correspond to the 2D projection of
                &#123;BERT&#125; embedding for raw document text.
                <br />
                Labels are aggregated over annotators using
                &#123;majority_vote&#125; &#40;If a tie happens in voting,
                "tied_annotations" is shown as aggregated class label&#41;.
            </Callout>
            {isLoading ? (
                <div className="bp3-skeleton full-parent-width">&nbsp;</div>
            ) : (
                <VegaLite spec={spec} />
            )}
        </ContentCard>
    );
};
