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
        
    };
    
    state ={lowBound:100000, upBound:4000000000};

     addOperator = () => {
        let fieldOptions = this.props.operatorOptions.map((operator) => {
            return operator;
        });

        this.updateFieldElement(
            this.props.filterField.rowId,
            "operator",
            this.props.operatorOptions[6],
            undefined,
            fieldOptions
        );
    };
    

    updateSliderValues = (values) => {
        this.setState({lowBound:values[0], upBound:values[1]})
        this.addOperator(); 
        let fieldOptions;
         this.updateFieldElement(
            this.props.filterField.rowId,
            "value",
            { lowBound: values[0], upBound: values[1] },
            "number",
            fieldOptions
        );
    };

   

    render() {
        addSliderFilter = () => {
            return (
                <Slider
                range={{ min: 0, max: 800000 }}
                start={[this.state.lowBound, this.state.upBound]} 
                format={{
                    from: (value) => Math.round(value),
                    to: (value) => Math.round(value),
                }}
                margin={30}
                onSlide={this.updateSliderValues.bind(this)}
                tooltips
                />
            );
        };

      
        

        let selectedAttribute = this.props.attributes.filter(
            (attribute) =>
                attribute.attribute === this.props.filterField.attribute
        )[0];

        return (
            <div className="container-fluid">
                <Row>
                <Col xs={11}>
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
                </Col>
                    {this.props.deleteButton ? <Col xs={1}>{this.props.deleteButton}</Col> : null}
                </Row>

                <Row> 
                    <Col xs={10}>{selectedAttribute && selectedAttribute.type==="number" ? addSliderFilter() : null}</Col> 
                </Row>
                
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