const PropTypes = require("prop-types");
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require("react");

const { Row, Col } = require("react-bootstrap");

const ComboField = require("./ComboField");
const assign = require("object-assign");
const LocaleUtils = require("../../MapStore2/web/client/utils/LocaleUtils");

const Slider = require("react-nouislider");

class FilterField extends React.Component {
    static propTypes = {
        attributes: PropTypes.array,
        filterField: PropTypes.object,
        operatorOptions: PropTypes.array,
        onUpdateField: PropTypes.func,
        maxFeaturesWPS: PropTypes.number,
        toggleMenu: PropTypes.func,
        deleteButton: PropTypes.node,
        onUpdateExceptionField: PropTypes.func,
        onChangeCascadingValue: PropTypes.func,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    static defaultProps = {
        attributes: [],
        filterField: null,
        operatorOptions: ["=", ">", "<", ">=", "<=", "<>", "><"],
        onUpdateField: () => {},
        toggleMenu: () => {},
        onUpdateExceptionField: () => {},
        onChangeCascadingValue: () => {},
        fieldName: null,
        fieldValue: null,
        state: [0, 50],
    };

    

    render() {
        renderOperatorField = () => {
            return (
                <Slider
                    range={{ min: 0, max: 1000000 }}
                    start={[0, 1000000]}
                    format={{
                        from: (value) => Math.round(value),
                        to: (value) => Math.round(value),
                    }}
                    
                    margin={30}
                    tooltips
                    onSlide={(values, event) => {
                        addOperator();
                        onButtonClicked(values);
                    }}
                />
            );
        };

        const addOperator = () => {
            let attType = undefined;
            let fieldName = this.props.operatorOptions[6];
            let fieldRowId = this.props.filterField.rowId;
            let name = "operator";
            let fieldOptions = this.props.operatorOptions.map((attribute) => {
                return attribute;
            });

            this.updateFieldElement(
                fieldRowId,
                name,
                fieldName,
                attType,
                fieldOptions
            );
        };
        const addAttribute = () => {
            let selectedAttribute = this.props.attributes[7].attribute;
            let attType = selectedAttribute && selectedAttribute.type;
            let fieldName = this.props.attributes[7].attribute;
            let fieldRowId = this.props.filterField.rowId;
            let name = "attribute";
            let fieldOptions = this.props.attributes.map((attribute) => {
                return { id: attribute.attribute, name: attribute.label };
            });

            this.updateFieldElement(
                fieldRowId,
                name,
                fieldName,
                attType,
                fieldOptions
            );
            addOperator();
        };
        const addLowerValue = (event) => {
            let selectedValue = "number";
            let attType = `values`;
            let fieldName = { lowBound: event.target.value };
            let fieldRowId = this.props.filterField.rowId;
            let name = "value";
            let fieldOptions;

            this.updateFieldElement(
                fieldRowId,
                name,
                fieldName,
                selectedValue,
                fieldOptions
            );
        };

        const addUpperValue = (event) => {
            let selectedValue = "number";
            let attType = `values`;
            let fieldName = { upBound: event.target.value };
            let fieldRowId = this.props.filterField.rowId;
            let name = "value";
            let fieldOptions;

            this.updateFieldElement(
                fieldRowId,
                name,
                fieldName,
                selectedValue,
                fieldOptions
            );
        };

        const onButtonClicked = (values) => {
            let selectedValue = "number";
            let attType = `values`;
            let fieldName = { lowBound: values[0], upBound: values[1] };
            let fieldRowId = this.props.filterField.rowId;
            let name = "value";
            let fieldOptions;

            this.updateFieldElement(
                fieldRowId,
                name,
                fieldName,
                selectedValue,
                fieldOptions
            );
        };

        let selectedAttribute = this.props.attributes.filter(
            (attribute) =>
                attribute.attribute === this.props.filterField.attribute
        )[0];

        return (
            <div className="container-fluid">
                


                <Row>
                    <ComboField
                        valueField={"id"}
                        textField={"name"}
                        fieldOptions={this.props.attributes.map((attribute) => {
                            return {
                                id: attribute.attribute,
                                name: attribute.label,
                            };
                        })}
                        placeholder={LocaleUtils.getMessageById(
                            this.context.messages,
                            "queryform.attributefilter.combo_placeholder"
                        )}
                        fieldValue={this.props.filterField.attribute}
                        attType={selectedAttribute && selectedAttribute.type}
                        fieldName="attribute"
                        fieldRowId={this.props.filterField.rowId}
                        onUpdateField={this.updateFieldElement}
                        comboFilter={"contains"}
                    />
                </Row>

                <Row>{selectedAttribute && selectedAttribute.type==="number" ? renderOperatorField() : null}</Row>
            </div>
        );
    }

    updateExceptionFieldElement = (rowId, message) => {
        this.props.onUpdateExceptionField(rowId, message);
    };

    updateFieldElement = (rowId, name, value, type, fieldOptions) => {
        let selectedAttribute;
        if (name === "attribute") {
            selectedAttribute = this.props.attributes.filter(
                (attribute) => attribute.attribute === value
            )[0];
            this.props.onUpdateField(
                rowId,
                name,
                value,
                (selectedAttribute && selectedAttribute.type) || type,
                fieldOptions
            );
        } else {
            this.props.onUpdateField(
                rowId,
                name,
                value,
                type === "boolean" ? "string" : type,
                fieldOptions
            );
        }

        if (name === "value") {
            // For cascading: filter the attributes that depends on
            let dependsOnAttributes = this.props.attributes.filter(
                (attribute) =>
                    attribute.dependson &&
                    attribute.dependson.field ===
                        this.props.filterField.attribute
            );
            if (dependsOnAttributes.length > 0) {
                // Perhaps There is some filterFields that need to reset their value
                this.props.onChangeCascadingValue(dependsOnAttributes);
            }
        }
    };
}

module.exports = FilterField;