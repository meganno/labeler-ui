import { Popover2 } from "@blueprintjs/popover2";
import { useState } from "react";
import { Button } from "@blueprintjs/core";
import { faCaretDown } from "@fortawesome/pro-duotone-svg-icons";
import { faIcon } from "../../icon";
export const DoubleClickPopover = ({
    target,
    content,
    shouldShowPopoverButton = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            onDoubleClick={() => setIsOpen(true)}
            style={{ position: "relative" }}
        >
            {target}
            <div
                style={{
                    marginTop: -1,
                    position: "absolute",
                    right: 0,
                    top: 0,
                }}
            >
                <Popover2
                    autoFocus
                    minimal
                    placement="bottom-end"
                    content={
                        <div onClickCapture={() => setIsOpen(false)}>
                            {content}
                        </div>
                    }
                    isOpen={isOpen && shouldShowPopoverButton}
                    hasBackdrop
                    backdropProps={{
                        onClick: () => setIsOpen(false),
                        onDoubleClick: (event) => event.stopPropagation(),
                        onWheelCapture: (event) => event.stopPropagation(),
                    }}
                >
                    <Button
                        style={{
                            display: shouldShowPopoverButton ? null : "none",
                        }}
                        minimal
                        small
                        active={isOpen}
                        icon={faIcon({
                            icon: faCaretDown,
                            style: { opacity: 0.5 },
                        })}
                        onClick={() => setIsOpen(true)}
                    />
                </Popover2>
            </div>
        </div>
    );
};
