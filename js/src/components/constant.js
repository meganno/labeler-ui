import { Tag } from "@blueprintjs/core";
import {
    faArrowDown91,
    faArrowDownZA,
    faArrowUp91,
    faArrowUpZA,
} from "@fortawesome/pro-duotone-svg-icons";
export const DEFAULT_ROW_HEIGHT = 39;
export const DEFAULT_COLUMN_CELL_ATTR = {
    width: 150,
    cellStyle: {
        lineHeight: DEFAULT_ROW_HEIGHT + "px",
    },
};
export const FIXED_COLUMN = ["data"];
export const HIDDEN_COLUMN_UNDER_RECONCILING = ["metadata"];
export const DEFAULT_COLUMN_STATE = {
    "table-column-last-submitted": {
        order: 0,
        width: 55,
    },
    "table-column-checkbox": {
        order: 1,
        width: 55,
    },
    "table-column-data": {
        order: 2,
        width: 300,
    },
    "table-column-reconciliation-summary": {
        order: 100,
        width: 300,
    },
    "table-column-metadata-popover-view": {
        order: 100,
        width: 300,
    },
};
export const MINIMUM_DASHBOARD_WIDGET_VIEW_HEIGHT = 300;
export const MINIMUM_ANNOTATION_WIDGET_VIEW_HEIGHT = 300;
export const EXPANDABLE_CHARS = ["_", "'"];
export const LABEL_SCHEMA_OKP = ["config", "label_schema"];
export const TAG_SCHEMA_OKP = ["config", "tag_schema"];
export const SPAN_LEVEL_CHAR_SCHEMA_KEY = "span_ch";
export const RECORD_LEVEL_SCHEMA_KEY = "record";
export const RECORD_LEVEL_LABEL_OKP = ["annotation_list", 0, "labels_record"];
export const SORT_ICONS = {
    asc: {
        string: faArrowUpZA,
        number: faArrowUp91,
    },
    desc: {
        string: faArrowDownZA,
        number: faArrowDown91,
    },
};
export const NAV_BAR_HEIGHT = 45;
export const DEFAULT_ANNOTATOR = {
    name: "labeler-ui",
    user_id: "labeler-ui",
};
export const GREEN_CHECK_COLOR = "#0F9960";
export const SEARCH_FORMAT_TAGS = {
    regex: (
        <Tag minimal intent="warning">
            regex
        </Tag>
    ),
    fuzzy: <Tag minimal>fuzzy</Tag>,
    exact: (
        <Tag
            minimal
            style={{
                color: "#634DBF",
                backgroundColor: "rgba(113, 87, 217, 0.15)",
            }}
        >
            exact
        </Tag>
    ),
};
export const DEFAULT_LABEL_COLOR_PALETTE = [
    {
        minimal: {
            backgroundColor: "rgba(209, 57, 19, 0.15)",
            color: "#B83211",
        },
        regular: {
            backgroundColor: "#D13913",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(143, 57, 143, 0.15)",
            color: "#752F75",
        },
        regular: {
            backgroundColor: "#8F398F",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(41, 101, 204, 0.15)",
            color: "#2458B3",
        },
        regular: {
            backgroundColor: "#2965CC",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(41, 166, 52, 0.15)",
            color: "#238C2C",
        },
        regular: {
            backgroundColor: "#29A634",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(217, 158, 11, 0.15)",
            color: "#BF8C0A",
        },
        regular: {
            backgroundColor: "#D99E0B",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(219, 44, 111, 0.15)",
            color: "#C22762",
        },
        regular: {
            backgroundColor: "#DB2C6F",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(113, 87, 217, 0.15)",
            color: "#634DBF",
        },
        regular: {
            backgroundColor: "#7157D9",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(0, 179, 164, 0.15)",
            color: "#00998C",
        },
        regular: {
            backgroundColor: "#00B3A4",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(155, 191, 48, 0.15)",
            color: "#87A629",
        },
        regular: {
            backgroundColor: "#9BBF30",
            color: "#ffffff",
        },
    },
    {
        minimal: {
            backgroundColor: "rgba(150, 98, 45, 0.15)",
            color: "#7D5125",
        },
        regular: {
            backgroundColor: "#96622D",
            color: "#ffffff",
        },
    },
];
export const ipy_function = function (code) {
    return new Promise((resolve, reject) => {
        var callbacks = {
            iopub: {
                output: (data) => {
                    try {
                        resolve(data.content.text.trim());
                    } catch (error) {
                        reject(
                            `${_.get(data.content, "ename", "")}: ${_.get(
                                data.content,
                                "evalue",
                                ""
                            )}`
                        );
                    }
                },
            },
        };
        Jupyter.notebook.kernel.execute(
            `import json; print(json.dumps(${code}))`,
            callbacks
        );
    });
};
