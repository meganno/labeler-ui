import { Cell, Column, Table2 } from "@blueprintjs/table";
import { HeaderCell } from "@blueprintjs/table/lib/esm/headers/headerCell";
import { useContext, useEffect, useState } from "react";
import { ContentCard } from "../ContentCard";
import { faFunction, faGrid } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { Callout, Intent } from "@blueprintjs/core";
import { faIcon } from "../../icon";
import { DashboardContext } from "../../context/DashboardContext";
import { ipy_function } from "../../constant";
import { actionToaster, createToast } from "../../toaster";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import { LabelClassSelect } from "../LabelClassSelect";
export const Agreement = () => {
    const { dashboardState } = useContext(DashboardContext);
    const [data, setData] = useState({});
    const [users, setUsers] = useState([]);
    const focusLabel = _.get(dashboardState, "focusLabel", "");
    useEffect(() => {
        if (_.isNil(focusLabel) || _.isEmpty(focusLabel)) return;
        const get_annotator_agreements_command = `${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_annotator_agreements(label_name='${focusLabel}')`;
        ipy_function(get_annotator_agreements_command)
            .then((result) => {
                var agreementMatrix = {};
                const agreements = JSON.parse(result);
                const keys = Object.keys(agreements);
                var uniqueUsers = new Set();
                for (var i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const annotators = key.split(",");
                    uniqueUsers.add(annotators[0]);
                    uniqueUsers.add(annotators[1]);
                    _.set(
                        agreementMatrix,
                        [annotators[0], annotators[1]],
                        agreements[key]
                    );
                }
                setUsers(Array.from(uniqueUsers));
                setData(agreementMatrix);
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () =>
                                copy(get_annotator_agreements_command),
                        },
                        message: (
                            <div>
                                <div>
                                    Can't get annotator agreements data; the
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
        <ContentCard title="Agreements" icon={faGrid}>
            <Callout
                icon={faIcon({ icon: faFunction, size: 21 })}
                style={{ marginBottom: 10 }}
            >
                Pairwise agreement score &#40;cohen_kappa&#41; on{" "}
                <LabelClassSelect /> subtask among all annotators. <br />
                Empty entries are not excluded and treated as same.
            </Callout>
            <div
                className="full-parent-width"
                style={{ marginTop: 10, height: 200 }}
            >
                <Table2
                    key={"annotator-agreement-table"}
                    numFrozenColumns={1}
                    numRows={users.length}
                    enableRowResizing={false}
                    rowHeaderCellRenderer={(rowIndex) => {
                        return (
                            <HeaderCell>
                                <div
                                    className="bp3-table-row-name"
                                    style={{
                                        textAlign: "center",
                                        minWidth: 40,
                                    }}
                                >
                                    {rowIndex}
                                </div>
                            </HeaderCell>
                        );
                    }}
                >
                    <Column
                        name=""
                        cellRenderer={(rowIndex) => (
                            <Cell>
                                {_.get(
                                    dashboardState,
                                    ["uidMap", users[rowIndex]],
                                    users[rowIndex]
                                )}
                            </Cell>
                        )}
                    />
                    {users.map((user, index) => {
                        return (
                            <Column
                                key={`annotator-aggrement-column-${index}`}
                                name={_.get(
                                    dashboardState,
                                    ["uidMap", user],
                                    user
                                )}
                                cellRenderer={(rowIndex, columnIndex) => {
                                    const rowUser = users[rowIndex],
                                        colUser = users[columnIndex - 1];
                                    if (_.isEqual(rowUser, colUser))
                                        return <Cell></Cell>;
                                    const score = _.get(
                                        data,
                                        [rowUser, colUser],
                                        null
                                    );
                                    return (
                                        <Cell>
                                            {_.isNumber(score) ? score : null}
                                        </Cell>
                                    );
                                }}
                            />
                        );
                    })}
                </Table2>
            </div>
        </ContentCard>
    );
};
