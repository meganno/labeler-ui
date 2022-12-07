import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const faIcon = (props) => {
    let { icon, className = [], size = 16, style = {} } = props;
    if (typeof className === "string") className = [className];
    className.push("bp3-icon");
    return (
        <FontAwesomeIcon
            className={classNames(...className)}
            style={{ width: size, height: size, ...style }}
            icon={icon}
        />
    );
};
