import {} from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import TimeAgo from "react-timeago";
import { faIcon } from "../../icon";
import {
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/pro-duotone-svg-icons";
import { Tooltip2 } from "@blueprintjs/popover2";
import { GREEN_CHECK_COLOR } from "../../constant";
export const LastSubmittedCell = ({ rowIndex }) => {
    const { annotatorState } = useContext(AnnotatorContext);
    const [submitState, setSubmitState] = useState(null);
    useEffect(() => {
        const uuid = _.get(annotatorState, ["data", rowIndex, "uuid"], null);
        if (uuid === null) setSubmitState(null);
        else {
            let newState = _.get(
                annotatorState,
                ["submissionAudit", uuid],
                null
            );
            setSubmitState(newState);
        }
    }, [annotatorState.submissionAudit]);
    const stateIcon = {
        success: faIcon({
            icon: faCheckCircle,
            style: { color: GREEN_CHECK_COLOR, opacity: 0.5 },
        }),
        error: faIcon({
            icon: faExclamationCircle,
            style: { color: "#DB3737", opacity: 0.5 },
        }),
    };
    if (submitState === null) return null;
    return (
        <div style={{ textAlign: "center" }}>
            <Tooltip2
                content={
                    <div>
                        Submitted <TimeAgo date={submitState.timestamp} />
                        <br />
                        {submitState.message}
                    </div>
                }
                minimal
                position="bottom-left"
            >
                {stateIcon[submitState.state]}
            </Tooltip2>
        </div>
    );
};
