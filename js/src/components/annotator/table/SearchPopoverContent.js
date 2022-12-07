import { SEARCH_FORMAT_TAGS } from "../../constant";
import {
    HTMLTable,
    Code,
    Collapse,
    Button,
    Divider,
    Tag,
} from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { faIcon } from "../../icon";
import { faAngleDown, faAngleRight } from "@fortawesome/pro-duotone-svg-icons";
export const SearchPopoverContent = ({ isTyping, queryString }) => {
    const { annotatorState } = useContext(AnnotatorContext);
    const [isSearchTipsExpanded, setIsSearchTipsExpanded] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => {
        if (queryString !== "" && annotatorState.miniSearch !== null) {
            try {
                const result =
                    annotatorState.miniSearch.autoSuggest(queryString);
                var newTerms = [];
                for (var i = 0; i < result.length; i++)
                    newTerms = newTerms.concat(result[i].terms);
                setSuggestions(
                    [...new Set(newTerms)].sort((a, b) => a.localeCompare(b))
                );
            } catch (error) {}
        } else setSuggestions([]);
    }, [queryString]);
    return (
        <div style={{ width: "100%", padding: 5 }}>
            {annotatorState.filter.highlightWords.length > 0 ? (
                <div
                    style={{ margin: "5px 11px 10px 11px" }}
                    className={isTyping ? "bp3-skeleton" : null}
                >
                    <Tag minimal style={{ marginRight: 5 }}>
                        Matching on
                    </Tag>
                    {annotatorState.filter.highlightWords.join(", ")}
                </div>
            ) : null}
            {annotatorState.filter.highlightWords.length > 0 ? (
                <Divider style={{ marginLeft: 0, marginRight: 0 }} />
            ) : null}
            {suggestions.length === 0 ? null : (
                <Button
                    style={{ pointerEvents: "none", marginBottom: 6 }}
                    alignText="left"
                    fill
                    minimal
                    text={<strong> Suggestions</strong>}
                />
            )}
            {suggestions.length === 0 ? null : (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        padding: "0px 11px 11px 11px",
                    }}
                >
                    {suggestions.map((suggestion) => (
                        <Tag
                            key={`search-popover-content-${suggestion}`}
                            large
                            minimal
                            style={{ marginRight: 7, marginBottom: 4 }}
                        >
                            {suggestion}
                        </Tag>
                    ))}
                </div>
            )}
            <Button
                alignText="left"
                fill
                rightIcon={faIcon({
                    icon: isSearchTipsExpanded ? faAngleDown : faAngleRight,
                })}
                minimal
                onClick={() => setIsSearchTipsExpanded(!isSearchTipsExpanded)}
                text={<strong>Search Mode Tips</strong>}
            />
            <Collapse isOpen={isSearchTipsExpanded}>
                <HTMLTable className="bp3-html-table-condensed">
                    <thead>
                        <tr>
                            <td>Mode</td>
                            <td>Tips</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{SEARCH_FORMAT_TAGS.fuzzy}</td>
                            <td style={{ lineHeight: "18px" }}>
                                Find terms with minimal character correction
                                (default)
                            </td>
                        </tr>
                        <tr>
                            <td>{SEARCH_FORMAT_TAGS.exact}</td>
                            <td style={{ lineHeight: "18px" }}>
                                Match terms in <Code>"quotes"</Code> exactly,
                                while combining multiple terms with an AND
                                condition
                            </td>
                        </tr>
                        <tr>
                            <td>{SEARCH_FORMAT_TAGS.regex}</td>
                            <td style={{ lineHeight: "18px" }}>
                                Apply <Code>/pattern/modifier</Code> syntax for
                                regex search
                            </td>
                        </tr>
                    </tbody>
                </HTMLTable>
            </Collapse>
        </div>
    );
};
