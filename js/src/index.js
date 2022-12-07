import * as React from "react";
import * as ReactDOM from "react-dom";
export function bind(node, config) {
    return {
        create: (component, props, children) =>
            React.createElement(component, props, ...children),
        render: (element) => ReactDOM.render(element, node),
        unmount: () => ReactDOM.unmountComponentAtNode(node),
    };
}
import withContext from "./components/context/withContext";
import { Annotator } from "./Annotator";
import { AnnotatorProvider } from "./components/context/AnnotatorContext";
const AnnotatorWidget = withContext(Annotator, AnnotatorProvider);
// import { SchemaBuilder } from "./SchemaBuilder";
// import { SchemaBuilderProvider } from "./components/context/SchemaBuilderContext";
// const SchemaBuilderWidget = withContext(SchemaBuilder, SchemaBuilderProvider);
import { Authentication } from "./Authentication";
import { AuthenticationProvider } from "./components/context/AuthenticationContext";
const AuthenticationWidget = withContext(
    Authentication,
    AuthenticationProvider
);
import { Dashboard } from "./Dashboard";
import { DashboardProvider } from "./components/context/DashboardContext";
const DashboardWidget = withContext(Dashboard, DashboardProvider);
import { ProjectManager } from "./ProjectManager";
import { ProjectManagerProvider } from "./components/context/ProjectManagerContext";
const ProjectManagerWidget = withContext(
    ProjectManager,
    ProjectManagerProvider
);
export {
    AnnotatorWidget,
    // SchemaBuilderWidget,
    AuthenticationWidget,
    DashboardWidget,
    ProjectManagerWidget,
};
