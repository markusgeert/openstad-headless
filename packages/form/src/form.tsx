import React, {useEffect, useState} from 'react';
import type {CombinedFieldPropsWithType, ComponentFieldProps, FormProps} from "./props";
import TextInput from "@openstad-headless/ui/src/form-elements/text";
import RangeSlider from "@openstad-headless/ui/src/form-elements/a-b-slider";
import CheckboxField from "@openstad-headless/ui/src/form-elements/checkbox";
import RadioboxField from "@openstad-headless/ui/src/form-elements/radio";
import SelectField from "@openstad-headless/ui/src/form-elements/select";
import TickmarkSlider from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import ImageUploadField from "@openstad-headless/ui/src/form-elements/image-upload";
import DocumentUploadField from "@openstad-headless/ui/src/form-elements/document-upload";
import MapField from "@openstad-headless/ui/src/form-elements/map";
import { handleSubmit } from "./submit";
import HiddenInput from "@openstad-headless/ui/src/form-elements/hidden";
import ImageChoiceField from "@openstad-headless/ui/src/form-elements/image-choice";
import InfoField from "@openstad-headless/ui/src/form-elements/info";
import { FormFieldErrorMessage, Button } from "@utrecht/component-library-react";
import './form.css'

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";

function Form({
      title = 'Form Widget',
      fields = [],
      submitText = 'Verzenden',
      submitHandler = () => {},
      submitDisabled = false,
      secondaryLabel = '',
      secondaryHandler = () => {},
      ...props
}: FormProps) {
    type FormValue = string | Record<number, never> | [];

    const initialFormValues: { [key: string]: FormValue } = {};
    fields.forEach((field) => {
        if (field.fieldKey) {
            //@ts-expect-error
            initialFormValues[field.fieldKey] = typeof field.defaultValue !== 'undefined' ? field.defaultValue : '';
            initialFormValues[field.fieldKey] = field.type === 'map' ? {} : initialFormValues[field.fieldKey];
        }
    });

    const [formValues, setFormValues] = useState(initialFormValues);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        handleSubmit(fields as unknown as Array<CombinedFieldPropsWithType>, formValues, setFormErrors, submitHandler);
    };

    const handleInputChange = (event: { name: string, value: FormValue}) => {
        const { name, value } = event;
        setFormValues((prevFormValues) => ({ ...prevFormValues, [name]: value }));
    };

    const componentMap: { [key: string]: React.ComponentType<ComponentFieldProps> } = {
        text: TextInput as React.ComponentType<ComponentFieldProps>,
        range: RangeSlider as React.ComponentType<ComponentFieldProps>,
        checkbox: CheckboxField as React.ComponentType<ComponentFieldProps>,
        radiobox: RadioboxField as React.ComponentType<ComponentFieldProps>,
        select: SelectField as React.ComponentType<ComponentFieldProps>,
        'tickmark-slider': TickmarkSlider as React.ComponentType<ComponentFieldProps>,
        imageUpload: ImageUploadField as React.ComponentType<ComponentFieldProps>,
        documentUpload: DocumentUploadField as React.ComponentType<ComponentFieldProps>,
        map: MapField as React.ComponentType<ComponentFieldProps>,
        hidden: HiddenInput as React.ComponentType<ComponentFieldProps>,
        imageChoice: ImageChoiceField as React.ComponentType<ComponentFieldProps>,
        none: InfoField as React.ComponentType<ComponentFieldProps>,
    };

    const renderField = (field: ComponentFieldProps, index: number) => {
        if (!field.type) {
            return null;
        }
        const Component = componentMap[field.type];
        if (Component) {
            return (
                <Component
                    {...field}
                    index={index}
                    onChange={handleInputChange}
                    {...props}
                />
            );
        }
    };

    return (
        <div className="form-widget">
            <div className="form-widget-container">
                {title && <h5 className="form-widget-title">{title}</h5>}

                <form className="form-container" noValidate onSubmit={handleFormSubmit}>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */}
                    {fields.map((field: ComponentFieldProps, index: number) => (
                        <div className={`question question-type-${field.type}`} key={index}>
                            {renderField(field, index)}
                            <FormFieldErrorMessage className="error-message">
                                {field.fieldKey && formErrors[field.fieldKey] && <span>{formErrors[field.fieldKey]}</span>}
                            </FormFieldErrorMessage>
                        </div>
                    ))}
                    {secondaryLabel && (
                        <Button appearance='primary-action-button' onClick={() => secondaryHandler(formValues)}
                                type="button">{secondaryLabel}</Button>
                    )}
                    <Button
                        appearance='primary-action-button'
                        type="submit"
                        disabled={submitDisabled}
                    >
                        {submitText}
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Form;
