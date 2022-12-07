import { useContext, useEffect, useState } from "react";
import { faBarsProgress } from "@fortawesome/pro-duotone-svg-icons";
import { ContentCard } from "../ContentCard";
import { Intent } from "@blueprintjs/core";
import { Cell, Column, Table2 } from "@blueprintjs/table";
import { DashboardContext } from "../../context/DashboardContext";
import { ipy_function } from "../../constant";
import { HeaderCell } from "@blueprintjs/table/lib/esm/headers/headerCell";
import { actionToaster, createToast } from "../../toaster";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import { faIcon } from "../../icon";
import _ from "lodash";
export const Contribution = () => {
    const { dashboardState, dashboardAction } = useContext(DashboardContext);
    const [data, setData] = useState([]);
    useEffect(() => {
        const get_annotator_contributions_command = `${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_annotator_contributions()`;
        ipy_function(get_annotator_contributions_command)
            .then((result) => {
                const contributions = JSON.parse(result);
                var tempData = [],
                    contributionKeys = Object.keys(contributions);
                const get_user_names_command = `${_.get(
                    dashboardState,
                    "ipy_interface.service"
                )}.get_users_by_uid(uid_list=${JSON.stringify(
                    contributionKeys
                )})`;
                ipy_function(get_user_names_command).then((result) => {
                    dashboardAction.updateUidMapping(JSON.parse(result));
                });
                for (var i = 0; i < contributionKeys.length; i++) {
                    const key = contributionKeys[i];
                    tempData.push({
                        uid: key,
                        total: contributions[key],
                    });
                }
                setData(tempData);
            })
            .catch((error) => {
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () =>
                                copy(get_annotator_contributions_command),
                        },
                        message: (
                            <div>
                                <div>
                                    Can't get annotator contributions data; the
                                    operation couldn't be completed.
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
        <ContentCard title="Contributions" icon={faBarsProgress}>
            <div className="full-parent-width" style={{ height: 200 }}>
                <Table2
                    key={"annotator-contribution-table"}
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
                                    {rowIndex + 1}
                                </div>
                            </HeaderCell>
                        );
                    }}
                    numRows={data.length}
                    enableRowResizing={false}
                >
                    <Column
                        name="Name"
                        cellRenderer={(rowIndex) => {
                            return (
                                <Cell>
                                    {_.get(
                                        dashboardState,
                                        ["uidMap", data[rowIndex].uid],
                                        data[rowIndex].uid
                                    )}
                                </Cell>
                            );
                        }}
                    />
                    <Column
                        name="Total"
                        cellRenderer={(rowIndex) => {
                            return <Cell>{data[rowIndex].total}</Cell>;
                        }}
                    />
                </Table2>
            </div>
        </ContentCard>
    );
};
