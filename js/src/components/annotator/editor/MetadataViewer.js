import { Callout } from "@blueprintjs/core";
import _ from "lodash";
import { useContext, useState, useEffect } from "react";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export const MetadataViewer = () => {
    const { annotatorState } = useContext(AnnotatorContext);
    const [metadata, setMetadata] = useState([]);
    useEffect(() => {
        setMetadata(
            _.get(
                annotatorState,
                ["data", annotatorState.dataFocusIndex, "metadata"],
                []
            )
        );
    }, [annotatorState.data, annotatorState.dataFocusIndex]);
    return (
        <div>
            {metadata.map((data, index) => {
                if (
                    _.isNil(_.get(data, "name", null)) ||
                    _.isNil(_.get(data, "value", null))
                )
                    return null;
                return (
                    <Callout
                        key={`metadata-viewer-callout-row-${index}`}
                        style={{
                            marginBottom: index + 1 < metadata.length ? 10 : 0,
                            backgroundColor: "#f6f7f9",
                        }}
                        title={data.name}
                    >
                        <ReactMarkdown
                            className="react-markdown-content"
                            remarkPlugins={[remarkGfm]}
                            children={data.value}
                        />
                    </Callout>
                );
            })}
        </div>
    );
};
