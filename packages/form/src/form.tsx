import RangeSlider from "@openstad-headless/ui/src/form-elements/a-b-slider";
import CheckboxField from "@openstad-headless/ui/src/form-elements/checkbox";
import DocumentUploadField from "@openstad-headless/ui/src/form-elements/document-upload";
import HiddenInput from "@openstad-headless/ui/src/form-elements/hidden";
import ImageChoiceField from "@openstad-headless/ui/src/form-elements/image-choice";
import ImageUploadField from "@openstad-headless/ui/src/form-elements/image-upload";
import InfoField from "@openstad-headless/ui/src/form-elements/info";
import MapField from "@openstad-headless/ui/src/form-elements/map";
import NumberInput from "@openstad-headless/ui/src/form-elements/number";
import RadioboxField from "@openstad-headless/ui/src/form-elements/radio";
import SelectField from "@openstad-headless/ui/src/form-elements/select";
import TextInput from "@openstad-headless/ui/src/form-elements/text";
import TickmarkSlider from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import {
	Button,
	FormFieldErrorMessage,
} from "@utrecht/component-library-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type {
	CombinedFieldPropsWithType,
	ComponentFieldProps,
	FormProps,
} from "./props";
import { handleSubmit } from "./submit";
import "./form.css";

export type FormValue = string | Record<number, never> | [];

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";

function Form({
	title = "Form Widget",
	fields = [],
	submitText = "Verzenden",
	submitHandler = () => {},
	submitDisabled = false,
	secondaryLabel = "",
	secondaryHandler = () => {},
	getValuesOnChange = () => {},
	allowResetAfterSubmit = true,
	currentPage,
	setCurrentPage,
	prevPage,
	...props
}: FormProps) {
	const initialFormValues: { [key: string]: FormValue } = {};
	fields.forEach((field) => {
		if (field.fieldKey) {
			initialFormValues[field.fieldKey] =
				// @ts-expect-error
				typeof field.defaultValue !== "undefined" ? field.defaultValue : "";
			initialFormValues[field.fieldKey] =
				field.type === "map" ? {} : initialFormValues[field.fieldKey];
		}
	});

	const [formValues, setFormValues] = useState(initialFormValues);
	const [formErrors, setFormErrors] = useState<{
		[key: string]: string | null;
	}>({});
	const formRef = useRef<HTMLFormElement>(null);
	const resetFunctions = useRef<Array<() => void>>([]);

	const handleFormSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const firstErrorKey = handleSubmit(
			fields as unknown as Array<CombinedFieldPropsWithType>,
			formValues,
			setFormErrors,
			submitHandler,
		);

		if (firstErrorKey && formRef.current) {
			const errorElement = formRef.current.querySelector(
				`[name="${firstErrorKey}"]`,
			);
			if (errorElement) {
				const elementPosition =
					errorElement.getBoundingClientRect().top + window.scrollY;
				const offsetPosition = elementPosition - 100;
				window.scrollTo({
					top: offsetPosition,
					behavior: "smooth",
				});
			}
		} else if (allowResetAfterSubmit) {
			resetForm();
		}
	};

	const handleInputChange = (event: { name: string; value: FormValue }) => {
		const { name, value } = event;
		setFormValues((prevFormValues) => ({ ...prevFormValues, [name]: value }));
	};

	const resetForm = () => {
		setFormValues(initialFormValues);
		setFormErrors({});
		resetFunctions.current.forEach((reset) => reset());
	};

	useEffect(() => {
		if (getValuesOnChange) {
			getValuesOnChange(formValues);
		}
	}, [formValues]);

	const scrollTop = () => {
		const formWidget = document.querySelector(".form-widget");
		if (formWidget) {
			const elementPosition =
				formWidget.getBoundingClientRect().top + window.scrollY;
			window.scrollTo({
				top: elementPosition,
				behavior: "smooth",
			});
		}
	};

	const componentMap: {
		[key: string]: React.ComponentType<ComponentFieldProps>;
	} = {
		text: TextInput as React.ComponentType<ComponentFieldProps>,
		range: RangeSlider as React.ComponentType<ComponentFieldProps>,
		checkbox: CheckboxField as React.ComponentType<ComponentFieldProps>,
		radiobox: RadioboxField as React.ComponentType<ComponentFieldProps>,
		select: SelectField as React.ComponentType<ComponentFieldProps>,
		"tickmark-slider":
			TickmarkSlider as React.ComponentType<ComponentFieldProps>,
		imageUpload: ImageUploadField as React.ComponentType<ComponentFieldProps>,
		documentUpload:
			DocumentUploadField as React.ComponentType<ComponentFieldProps>,
		map: MapField as React.ComponentType<ComponentFieldProps>,
		hidden: HiddenInput as React.ComponentType<ComponentFieldProps>,
		imageChoice: ImageChoiceField as React.ComponentType<ComponentFieldProps>,
		number: NumberInput as React.ComponentType<ComponentFieldProps>,
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
					{...props}
					index={index}
					onChange={handleInputChange}
					reset={(resetFn: () => void) => resetFunctions.current.push(resetFn)}
					{...field}
				/>
			);
		}
	};

	return (
		<div className="form-widget">
			<div className="form-widget-container">
				{title && <h5 className="form-widget-title">{title}</h5>}

				<form
					className="form-container"
					noValidate
					onSubmit={handleFormSubmit}
					ref={formRef}
				>
					{/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */}
					{fields.map((field: ComponentFieldProps, index: number) => (
						<div className={`question question-type-${field.type}`} key={index}>
							{renderField(field, index)}
							<FormFieldErrorMessage className="error-message">
								{field.fieldKey && formErrors[field.fieldKey] && (
									<span>{formErrors[field.fieldKey]}</span>
								)}
							</FormFieldErrorMessage>
						</div>
					))}
					{secondaryLabel && (
						<Button
							appearance="primary-action-button"
							onClick={() => secondaryHandler(formValues)}
							type="button"
						>
							{secondaryLabel}
						</Button>
					)}
					<div className="button-group">
						{currentPage > 0 && (
							<Button
								appearance="secondary-action-button"
								type="button"
								className="osc-prev-button"
								onClick={() => {
									setCurrentPage?.(currentPage - 1);
									scrollTop();
								}}
							>
								Vorige
							</Button>
						)}
						<Button
							appearance="primary-action-button"
							type="submit"
							disabled={submitDisabled}
							onClick={() => {
								scrollTop();
							}}
						>
							{submitText}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Form;
