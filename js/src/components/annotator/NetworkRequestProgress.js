import { Tooltip2 } from "@blueprintjs/popover2";
import { ProgressBar } from "@blueprintjs/core";
import { useContext } from "react";
import { AnnotatorContext } from "../context/AnnotatorContext";
export const NetworkRequestProgress = () => {
    const { annotatorState } = useContext(AnnotatorContext);
    return (
        <Tooltip2
            minimal
            usePortal={false}
            position="top"
            content={`${
                annotatorState.networkRequests.queued -
                annotatorState.networkRequests.completed
            } network request${
                annotatorState.networkRequests.queued -
                    annotatorState.networkRequests.completed >
                1
                    ? "s"
                    : ""
            } remaining`}
        >
            <div style={{ width: 100, marginTop: 2 }}>
                <ProgressBar
                    stripes
                    animate
                    value={
                        annotatorState.networkRequests.completed /
                        annotatorState.networkRequests.queued
                    }
                />
            </div>
        </Tooltip2>
    );
};
