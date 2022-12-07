import { Card, Tag } from "@blueprintjs/core";
import { min } from "lodash";
import { faIcon } from "../icon";
export const ContentCard = ({ children, title, icon }) => {
    return (
        <Card style={{ padding: 10 }}>
            <Tag
                icon={faIcon({ icon: icon })}
                fill
                large
                intent="primary"
                minimal
                style={{ marginBottom: 10 }}
            >
                {title}
            </Tag>
            <div>{children}</div>
        </Card>
    );
};
