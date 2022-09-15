import React from 'react';
import { Text, Box, Newline } from 'ink';
import SelectInput from 'ink-select-input';
import { ISelectOption } from '../commands/Init';
import { IInitTextInputProps } from './InitTextInput';

interface IInitSelectInputProps extends IInitTextInputProps {
  itemList?: Array<ISelectOption>;
}

const InitSelectInput = (props: IInitSelectInputProps) => {
  const { target, label, rangeNum, itemList, step, result, setStep, setResult } = props;

  const selectOption = (key: string, item: ISelectOption) => {
    if (item.value) setResult({ ...result, [key]: item.value });
    setStep(step + 1);
  };

  return (
    <Box>
      {step > rangeNum ? (
        <Box flexDirection="column">
          <Box marginRight={1}>
            <Text>
              <Text color="green">?</Text> Please pick a {label}: <Text color="gray">(Use arrow keys)</Text>
            </Text>
          </Box>
          <SelectInput
            items={itemList}
            onSelect={(item) => selectOption(target, item)}
            isFocused={step > rangeNum + 1 ? false : true}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export default InitSelectInput;
