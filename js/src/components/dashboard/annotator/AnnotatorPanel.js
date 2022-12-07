import {
    MenuItem,
    Menu,
    Button,
    PopoverInteractionKind,
} from "@blueprintjs/core";
import {
    faGrid,
    faBarsProgress,
    faListTree,
} from "@fortawesome/pro-duotone-svg-icons";
import { Popover2 } from "@blueprintjs/popover2";
import _ from "lodash";
import { faIcon } from "../../icon";
import { Agreement } from "./Agreement";
import { Contribution } from "./Contribution";
import { useRef } from "react";
export const AnnotatorPanel = () => {
    const contributionRef = useRef(null);
    const aggrementRef = useRef(null);
    const parentRef = useRef(null);
    return (
        <div
            className="overscroll-behavior-contain"
            style={{
                marginTop: 1,
                overflowY: "scroll",
                height: "100%",
            }}
            ref={parentRef}
        >
            <div
                style={{
                    margin: "19px 10px 20px 20px",
                    position: "absolute",
                    height: 40,
                    width: 40,
                }}
            >
                <Popover2
                    enforceFocus={false}
                    interactionKind={PopoverInteractionKind.HOVER}
                    position="bottom-left"
                    minimal
                    content={
                        <Menu>
                            <MenuItem
                                onClick={() =>
                                    parentRef.current.scrollTo({
                                        top:
                                            contributionRef.current.offsetTop -
                                            parentRef.current.offsetTop -
                                            20,
                                        behavior: "smooth",
                                    })
                                }
                                icon={faIcon({ icon: faBarsProgress })}
                                text="Contributions"
                            />
                            <MenuItem
                                onClick={() =>
                                    parentRef.current.scrollTo({
                                        top:
                                            aggrementRef.current.offsetTop -
                                            parentRef.current.offsetTop -
                                            20,
                                        behavior: "smooth",
                                    })
                                }
                                icon={faIcon({ icon: faGrid })}
                                text="Agreements"
                            />
                        </Menu>
                    }
                >
                    <Button
                        style={{ padding: 0 }}
                        large
                        minimal
                        icon={faIcon({ icon: faListTree })}
                    />
                </Popover2>
            </div>
            <div
                style={{
                    width: "calc(100% - 70px)",
                    padding: "20px 20px 20px 1px",
                    marginLeft: 70,
                }}
            >
                <div ref={contributionRef}>
                    <Contribution />
                </div>
                <div style={{ marginTop: 10 }} ref={aggrementRef}>
                    <Agreement />
                </div>
            </div>
        </div>
    );
};
