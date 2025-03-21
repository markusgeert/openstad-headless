import { Spacer } from "@openstad-headless/ui/src";
import {
	AccordionProvider,
	Fieldset,
	FieldsetLegend,
	FormField,
	FormFieldDescription,
	FormLabel,
	Paragraph,
	RadioButton,
} from "@utrecht/component-library-react";
import React, { type FC, useState } from "react";
import { useEffect } from "react";
import TextInput from "../text";

export type RadioboxFieldProps = {
	title: string;
	description?: string;
	choices?: {
		value: string;
		label: string;
		isOtherOption?: boolean;
		defaultValue?: boolean;
	}[];
	fieldRequired?: boolean;
	requiredWarning?: string;
	fieldKey: string;
	disabled?: boolean;
	type?: string;
	onChange?: (e: {
		name: string;
		value: string | Record<number, never> | [];
	}) => void;
	showMoreInfo?: boolean;
	moreInfoButton?: string;
	moreInfoContent?: string;
	infoImage?: string;
};

const RadioboxField: FC<RadioboxFieldProps> = ({
	title,
	description,
	choices,
	fieldRequired = false,
	fieldKey,
	onChange,
	disabled = false,
	showMoreInfo = false,
	moreInfoButton = "Meer informatie",
	moreInfoContent = "",
	infoImage = "",
}) => {
	const [selectedOption, setSelectedOption] = useState<string>("");
	const [otherOptionValues, setOtherOptionValues] = useState<{
		[key: string]: string;
	}>({});

	class HtmlContent extends React.Component<{ html: any }> {
		render() {
			const { html } = this.props;
			return <div dangerouslySetInnerHTML={{ __html: html }} />;
		}
	}

	useEffect(() => {
		const initialOtherOptionValues: { [key: string]: string } = {};
		choices?.forEach((choice, index) => {
			if (choice.isOtherOption) {
				initialOtherOptionValues[`${fieldKey}_${index}_other`] = "";
			}
		});
		setOtherOptionValues(initialOtherOptionValues);
	}, [choices, fieldKey]);

	const handleRadioChange = (value: string, index: number) => {
		setSelectedOption(value);
		if (onChange) {
			onChange({
				name: fieldKey,
				value: value,
			});
		}
		Object.keys(otherOptionValues).forEach((key) => {
			if (key !== `${fieldKey}_${index}_other`) {
				otherOptionValues[key] = "";
				if (onChange) {
					onChange({
						name: key,
						value: "",
					});
				}
			}
		});
		setOtherOptionValues({ ...otherOptionValues });
	};

	const handleOtherOptionChange = (e: { name: string; value: string }) => {
		setOtherOptionValues({
			...otherOptionValues,
			[e.name]: e.value,
		});
		if (onChange) {
			onChange({
				name: e.name,
				value: e.value,
			});
		}
	};

	if (choices) {
		choices = choices.map((choice) => {
			if (typeof choice === "string") {
				return { value: choice, label: choice };
			}
			return choice;
		}) as [
			{
				value: string;
				label: string;
				isOtherOption?: boolean;
				defaultValue?: boolean;
			},
		];
	}

	return (
		<div className="question">
			<Fieldset role="radiogroup">
				<FieldsetLegend>{title}</FieldsetLegend>

				{description && (
					<>
						<FormFieldDescription
							dangerouslySetInnerHTML={{ __html: description }}
						/>
						<Spacer size={0.5} />
					</>
				)}

				{showMoreInfo && (
					<>
						<AccordionProvider
							sections={[
								{
									headingLevel: 3,
									body: <HtmlContent html={moreInfoContent} />,
									expanded: undefined,
									label: moreInfoButton,
								},
							]}
						/>
						<Spacer size={1.5} />
					</>
				)}

				{infoImage && (
					<figure className="info-image-container">
						<img src={infoImage} alt="" />
						<Spacer size={0.5} />
					</figure>
				)}

				{choices?.map((choice, index) => (
					<>
						<FormField type="radio" key={index}>
							<Paragraph className="utrecht-form-field__label utrecht-form-field__label--radio">
								<FormLabel
									htmlFor={`${fieldKey}_${index}`}
									type="radio"
									className="--label-grid"
								>
									<RadioButton
										className="utrecht-form-field__input"
										id={`${fieldKey}_${index}`}
										name={fieldKey}
										required={fieldRequired}
										onChange={() => handleRadioChange(choice.value, index)}
										disabled={disabled}
										value={choice?.value}
									/>
									<span>{choice?.label}</span>
								</FormLabel>
							</Paragraph>
						</FormField>
						{choice.isOtherOption && selectedOption === choice.value && (
							<div className="marginTop10 marginBottom15">
								<TextInput
									type="text"
									// @ts-ignore
									onChange={(e: { name: string; value: string }) =>
										handleOtherOptionChange(e)
									}
									fieldKey={`${fieldKey}_${index}_other`}
									title=""
								/>
							</div>
						)}
					</>
				))}
			</Fieldset>
		</div>
	);
};

export default RadioboxField;
