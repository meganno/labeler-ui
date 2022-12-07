import { Tag, Callout } from "@blueprintjs/core";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import _ from "lodash";
import { useContext } from "react";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { DoubleClickPopover } from "./DoubleClickPopover";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export const MetadataCell = ({ rowIndex }) => {
    const { annotatorState } = useContext(AnnotatorContext);
    const metadata = _.get(annotatorState, ["data", rowIndex, "metadata"], []);
    const showFullMetadataValue = _.get(
            annotatorState,
            "settings.showFullMetadataValue",
            false
        ),
        metadataFocusName = _.get(
            annotatorState,
            "settings.metadataFocusName",
            null
        );
    const MarkdownRenderer = ({ value }) => {
        return (
            <ReactMarkdown
                className="react-markdown-content"
                remarkPlugins={[remarkGfm]}
                children={value}
            />
        );
    };
    return (
        <DoubleClickPopover
            shouldShowPopoverButton={!_.isEmpty(metadata)}
            content={
                <div
                    className="popover2-content-view-dimension"
                    style={{
                        padding: 10,
                        overflowY: "scroll",
                    }}
                    onWheelCapture={(event) => event.stopPropagation()}
                >
                    {metadata.map((data, index) => {
                        if (
                            _.isNil(_.get(data, "name", null)) ||
                            _.isNil(_.get(data, "value", null))
                        )
                            return null;
                        return (
                            <Callout
                                style={{
                                    marginBottom:
                                        index + 1 < metadata.length ? 10 : 0,
                                    backgroundColor: "#f6f7f9",
                                }}
                                key={`metadata-detailed-view-row-${rowIndex}-${index}`}
                                title={data.name}
                            >
                                <MarkdownRenderer
                                    key={`metadata-detailed-view-markdown-${rowIndex}-${index}`}
                                    value={data.value}
                                />
                            </Callout>
                        );
                    })}
                </div>
            }
            target={
                <div
                    style={{
                        overflow: "hidden",
                        width: "calc(100% - 34px)",
                        height: 39,
                    }}
                >
                    {_.isEmpty(metadata) ||
                    (showFullMetadataValue &&
                        (_.isEmpty(metadataFocusName) ||
                            _.isNil(metadataFocusName)))
                        ? "-"
                        : metadata.map((data, index) => {
                              if (showFullMetadataValue) {
                                  if (_.isEqual(data.name, metadataFocusName)) {
                                      if (
                                          _.isNil(_.get(data, "name", null)) ||
                                          _.isNil(_.get(data, "value", null))
                                      )
                                          return "-";
                                      return (
                                          <MarkdownRenderer
                                              key={`metadata-focus-view-markdown-${rowIndex}-${index}`}
                                              value={data.value}
                                          />
                                      );
                                  } else return null;
                              }
                              if (
                                  _.isNil(_.get(data, "name", null)) ||
                                  _.isNil(_.get(data, "value", null))
                              )
                                  return null;
                              return (
                                  <Popover2
                                      key={`metadata-cell-popover-row-${rowIndex}-${index}`}
                                      minimal
                                      interactionKind={
                                          Popover2InteractionKind.HOVER_TARGET_ONLY
                                      }
                                      position="top-left"
                                      content={
                                          <div
                                              className="popover2-content-view-dimension"
                                              style={{
                                                  padding: 10,
                                                  overflowY: "hidden",
                                              }}
                                          >
                                              <MarkdownRenderer
                                                  key={`metadata-hover-view-markdown-${rowIndex}-${index}`}
                                                  value={data.value}
                                              />
                                          </div>
                                      }
                                  >
                                      <Tag
                                          style={{ marginRight: 5 }}
                                          minimal
                                          key={`metadata-cell-tag-row-${rowIndex}-${index}`}
                                      >
                                          {data.name}
                                      </Tag>
                                  </Popover2>
                              );
                          })}
                </div>
            }
        />
    );
};
