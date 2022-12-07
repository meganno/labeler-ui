import bpCss from "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import normalizeCss from "../node_modules/normalize.css/normalize.css";
import bpPopover2Css from "../node_modules/@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import bpTableCss from "../node_modules/@blueprintjs/table/lib/css/table.css";
import customCss from "../styles/custom.css";
import utilityCss from "../styles/utility.css";
import { FocusStyleManager, Card } from "@blueprintjs/core";
FocusStyleManager.onlyShowFocusOnTabs();
export const Base = (props = {}) => {
    return (
        <div style={{ position: "relative" }}>
            <style>{normalizeCss}</style>
            <style>{bpCss}</style>
            <style>{bpPopover2Css}</style>
            <style>{bpTableCss}</style>
            <style>{customCss}</style>
            <style>{utilityCss}</style>
            <Card style={{ padding: 0, margin: 1, overflow: "hidden" }}>
                {props.children}
            </Card>
        </div>
    );
};
