import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading3, Paragraph, Button } from "@utrecht/component-library-react";

type Props = {
  loginUrl: string;
  step3: string;
  stemCodeTitle: string;
};
export const Step3 = ({ step3, stemCodeTitle, ...props }: Props) => {
  return (
    <>
      <Heading3>Controleer stemcode</Heading3>
      <Paragraph>{step3}</Paragraph>
      <Spacer size={2} />
      <Button
        appearance='primary-action-button'
        onClick={(e) => {
          const loginUrl = new URL(props.loginUrl);
          document.location.href = loginUrl.toString();
        }}>
        {stemCodeTitle}
      </Button>
    </>
  );
};
