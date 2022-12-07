import { Tag } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { DEFAULT_ROW_HEIGHT } from "../../constant";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { DoubleClickPopover } from "./DoubleClickPopover";
export const ReconciliationSummaryCell = ({ rowIndex }) => {
    const { annotatorState } = useContext(AnnotatorContext);
    const [targetContent, setTargetContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentLabel = _.get(
        annotatorState,
        "reconciliation.currentLabel",
        null
    );
    useEffect(() => {
        setLoading(true);
        const uuid = _.get(annotatorState, ["data", rowIndex, "uuid"], null);
        if (currentLabel !== null && uuid !== null) {
            const reconData = _.get(
                annotatorState,
                ["reconciliation", "data", uuid],
                null
            );
            const reconDataLabel = _.get(reconData, currentLabel, null);
            if (reconData === null || reconDataLabel === null)
                setTargetContent(null);
            else {
                setTargetContent(reconDataLabel);
            }
        } else {
            setTargetContent(null);
        }
        setLoading(false);
    }, [annotatorState.reconciliation]);
    const labelValueCounter = () => {
        if (targetContent === null) return null;
        const targetKeys = Object.keys(targetContent);
        var valueCount = {},
            totalCount = 0;
        for (var i = 0; i < targetKeys.length; i++) {
            if (targetKeys[i] === "reconciliation") continue;
            const labelValue = _.get(targetContent, [targetKeys[i], 0], null);
            if (labelValue === null) continue;
            totalCount += 1;
            if (valueCount[labelValue] === undefined) {
                valueCount[labelValue] = 1;
            } else {
                valueCount[labelValue] += 1;
            }
        }
        if (_.isEmpty(valueCount)) return null;
        var sortedCount = [];
        const countKeys = Object.keys(valueCount);
        for (var i = 0; i < countKeys.length; i++) {
            const individualCount = valueCount[countKeys[i]];
            sortedCount.push({
                key: countKeys[i],
                value: individualCount,
                percent: ((individualCount / totalCount) * 100).toFixed(2),
            });
        }
        sortedCount = sortedCount.sort((a, b) => b.value - a.value);
        for (var i = 0; i < countKeys.length; i++) {
            var borderStyles = {
                borderRadius: 0,
                borderRight: "2px solid rgba(115, 134, 148, 0.3)",
            };
            if (i === 0 && i === countKeys.length - 1) {
                borderStyles = {};
            } else if (i === 0) {
                borderStyles = {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRight: "2px solid rgba(115, 134, 148, 0.3)",
                };
            } else if (i === countKeys.length - 1) {
                borderStyles = {
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                };
            }
            _.set(sortedCount, [i, "style"], borderStyles);
        }
        return sortedCount;
    };
    const [randomLengthString] = useState(
        Math.random()
            .toString(36)
            .substring(0, Math.random() * 13)
    );
    const countResult = labelValueCounter();
    if (loading) {
        return (
            <Tag minimal className="bp3-skeleton">
                {randomLengthString}
                {randomLengthString}
            </Tag>
        );
    }
    return (
        <DoubleClickPopover
            shouldShowPopoverButton={!_.isNil(targetContent)}
            content={
                <div
                    className="popover2-content-view-dimension"
                    style={{ overflow: "hidden", padding: 5 }}
                >
                    {_.isNil(targetContent) ? null : (
                        <table>
                            <tbody>
                                {Object.keys(targetContent).map(
                                    (uid, index) => {
                                        return (
                                            <tr
                                                key={`reconciliation-summary-cell-table-row-${rowIndex}-${uid}`}
                                            >
                                                <td>
                                                    <span
                                                        style={{
                                                            marginRight: 5,
                                                        }}
                                                    >
                                                        {_.get(
                                                            annotatorState,
                                                            ["uidMap", uid],
                                                            uid
                                                        )}
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        paddingTop:
                                                            index > 0
                                                                ? 1.25
                                                                : 0,
                                                        paddingBottom:
                                                            _.isEqual(
                                                                index,
                                                                targetContent.length -
                                                                    1
                                                            )
                                                                ? 0
                                                                : 1.25,
                                                    }}
                                                >
                                                    {targetContent[uid].map(
                                                        (label, index) => {
                                                            const tagStyle =
                                                                _.get(
                                                                    annotatorState,
                                                                    [
                                                                        "labelTagStyles",
                                                                        currentLabel,
                                                                        label,
                                                                        "minimal",
                                                                    ],
                                                                    {}
                                                                );
                                                            return (
                                                                <Tag
                                                                    key={`reconciliation-summary-cell-detail-row-${rowIndex}-${uid}`}
                                                                    minimal
                                                                    style={{
                                                                        ...tagStyle,
                                                                        marginRight:
                                                                            index >
                                                                            0
                                                                                ? 5
                                                                                : 0,
                                                                    }}
                                                                >
                                                                    {label}
                                                                </Tag>
                                                            );
                                                        }
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            }
            target={
                <div
                    style={{
                        height: DEFAULT_ROW_HEIGHT + "px",
                        display: "inline-flex",
                        lineHeight: DEFAULT_ROW_HEIGHT + "px",
                        alignItems: "center",
                        overflow: "hidden",
                        width: "calc(100% - 34px)",
                    }}
                >
                    {targetContent === null || countResult === null
                        ? "-"
                        : countResult.map((curr, index) => {
                              const tagStyle = _.get(
                                  annotatorState,
                                  [
                                      "labelTagStyles",
                                      currentLabel,
                                      curr.key,
                                      "minimal",
                                  ],
                                  {}
                              );
                              return (
                                  <Tag
                                      key={`reconciliation-summary-cell-row-${rowIndex}-stats-tag-${index}`}
                                      style={{
                                          ...curr.style,
                                          ...tagStyle,
                                          width: `${curr.percent}%`,
                                      }}
                                  >
                                      <Tooltip2
                                          className="full-parent-width"
                                          position="top"
                                          content={
                                              <div>
                                                  {curr.key}:{" "}
                                                  <span
                                                      style={{
                                                          fontWeight: "bolder",
                                                      }}
                                                  >
                                                      {curr.percent}% (
                                                      {curr.value})
                                                  </span>
                                              </div>
                                          }
                                      >
                                          <div>
                                              {curr.key}:{" "}
                                              <span>{curr.percent}%</span>
                                          </div>
                                      </Tooltip2>
                                  </Tag>
                              );
                          })}
                </div>
            }
        />
    );
};
