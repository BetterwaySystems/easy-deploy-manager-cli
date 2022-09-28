import React from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import { UncontrolledTextInput } from 'ink-text-input';
import { ISelectOption, IDefaultInitInfo, IInitSettingForComponent } from '../commands/Init';

interface InitDefaultInputComponentProps {
  initSettingInfo: IInitSettingForComponent;
  defaultInitInfo: IDefaultInitInfo;
  step: number;
  setStep: (step: number) => void;
  setDefaultInitInfo: (defaultInitInfo: IDefaultInitInfo) => void;
}
interface IInitKeyInfoForSetValue {
  index: number;
  oneDepth: string | undefined;
  twoDepth: string | undefined;
}

const InitDefaultInputComponent = (props: InitDefaultInputComponentProps) => {
  const { initSettingInfo, step, defaultInitInfo, setStep, setDefaultInitInfo } = props;
  const { type, target, label, rangeNum, itemList, defaultValue } = initSettingInfo;
  const splitTarget = target.split('.');

  /**
   * It fills the depth of the object by looping through the recursive function
   * @param {Record<string, any>} targetObject is default initialize information
   * @param {IInitKeyInfoForSetValue} { index, oneDepth, twoDepth } is for looping
   * @param {string} value is input or select value
   */
  const recursiveForAssignValue = (targetObject: Record<string, any>, { index, oneDepth, twoDepth }: IInitKeyInfoForSetValue, value: string) => {
    if (!twoDepth) targetObject[`${oneDepth}`] = value;
    else {
      index += 1;
      recursiveForAssignValue(targetObject[`${oneDepth}`], { index, oneDepth: splitTarget[index], twoDepth: splitTarget[index + 1] }, value);
    }
  };

  /**
   *
   * @param {string} value is input or select value
   * @returns - If you don't enter the required values, you can't proceed to the next step.
   */
  const setDefaultValue = (value: string) => {
    const requiredValue = ['appName'];
    if (requiredValue.includes(target) && !value) return;

    if (value) {
      let index = 0;
      const keyInfo = { index, oneDepth: splitTarget[index], twoDepth: splitTarget[index + 1] };
      recursiveForAssignValue(defaultInitInfo, keyInfo, value);
      setDefaultInitInfo(defaultInitInfo);
    }
    setStep(step + 1);
  };

  return (
    <Box>
      {step > rangeNum ? (
        <Box flexDirection={type === 'textInput' ? 'row' : 'column'}>
          <Box marginRight={1}>
            {type === 'textInput' ? (
              <Text>
                <Text color="green">?</Text> {label}: {defaultValue ? <Text color="gray">({defaultValue})</Text> : ''}
              </Text>
            ) : (
              <Text>
                <Text color="green">?</Text> Please pick a {label}: {defaultValue ? <Text color="gray">({defaultValue})</Text> : ''}
              </Text>
            )}
          </Box>
          {type === 'textInput' ? (
            <UncontrolledTextInput onSubmit={setDefaultValue} focus={step > rangeNum + 1 ? false : true} />
          ) : (
            <SelectInput
              items={itemList}
              onSelect={(item: ISelectOption) => setDefaultValue(item.value)}
              isFocused={step > rangeNum + 1 ? false : true}
            />
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default InitDefaultInputComponent;
