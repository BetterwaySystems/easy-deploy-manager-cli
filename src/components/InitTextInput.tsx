import React from 'react';
import { Text, Box } from 'ink';
import { UncontrolledTextInput } from 'ink-text-input';
import { IDefaultDeployInfo } from '../commands/Init';

interface IInitTextInputProps {
  target: string;
  label: string;
  rangeNum: number;
  step: number;
  defaultValue?: string;
  defaultInitInfo: IDefaultDeployInfo;
  setStep: (step: number) => void;
  setDefaultInitInfo: (defaultInitInfo: IDefaultDeployInfo) => void;
}

interface IInitKeyInfoForSetValue {
  index: number;
  oneDepth: string | undefined;
  twoDepth: string | undefined;
}

const InitTextInput = (props: IInitTextInputProps) => {
  const { target, label, rangeNum, step, defaultValue, defaultInitInfo, setStep, setDefaultInitInfo } = props;
  const splitTarget = target.split('.');

  const recursiveForAssignValue = (
    targetObject: Record<string, any>,
    { index, oneDepth, twoDepth }: IInitKeyInfoForSetValue,
    value: string
  ) => {
    if (!twoDepth) targetObject[`${oneDepth}`] = value;
    else {
      index += 1;
      recursiveForAssignValue(
        targetObject[`${oneDepth}`],
        { index, oneDepth: splitTarget[index], twoDepth: splitTarget[index + 1] },
        value
      );
    }
  };

  const setInputValue = (value: string) => {
    if (value) {
      let index = 0;
      const keyInfo = { index, oneDepth: splitTarget[index], twoDepth: splitTarget[index + 1] };
      const copyInitValueForDeploy = JSON.parse(JSON.stringify(defaultInitInfo));

      recursiveForAssignValue(copyInitValueForDeploy, keyInfo, value);
      setDefaultInitInfo(copyInitValueForDeploy);
    }
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
          <UncontrolledTextInput onSubmit={setInputValue} focus={step > rangeNum + 1 ? false : true} />
        </Box>
      ) : null}
    </Box>
  );
};

export default InitTextInput;
export { IInitTextInputProps };
