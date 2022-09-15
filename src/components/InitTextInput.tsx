import React from 'react';
import { Text, Box } from 'ink';
import { UncontrolledTextInput } from 'ink-text-input';

interface IInitTextInputProps {
  target: string;
  label: string;
  rangeNum: number;
  step: number;
  defaultValue?: string;
  result: { [key: string]: string | { [key: string]: string } };
  setStep: (step: number) => void;
  setResult: (result: { [key: string]: string | { [key: string]: string } }) => void;
}

const InitTextInput = (props: IInitTextInputProps) => {
  const { target, label, rangeNum, step, defaultValue, result, setStep, setResult } = props;
  const onSubmit = (key: string, value: string) => {
    if (value) setResult({ ...result, [key]: value });
    setStep(step + 1);
  };

  return (
    <Box>
      {step > rangeNum ? (
        <Box>
          <Box marginRight={1}>
            <Text>
              <Text color="green">?</Text> {label}: {defaultValue ? <Text color="gray">({defaultValue})</Text> : ''}
            </Text>
          </Box>
          <UncontrolledTextInput
            onSubmit={(value: string) => onSubmit(target, value)}
            focus={step > rangeNum + 1 ? false : true}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export default InitTextInput;
export { IInitTextInputProps };
