import React from 'react';
import { Box, Text } from 'ink';
import { useAppInput } from './hooks/useAppInput.js';

const App: React.FC = () => {
  const { state } = useAppInput();

  const renderMenu = () => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
    >
      <Text bold color="cyan">
        ╔══════════════════════╗
      </Text>
      <Text bold color="cyan">
        ║ Calculator Menu ║
      </Text>
      <Text bold color="cyan">
        ╚══════════════════════╝
      </Text>
      <Text> </Text>
      {state.selectedIndex === 0 ? (
        <Text bold color="green">
          ▶ Sum two numbers
        </Text>
      ) : (
        <Text> Sum two numbers</Text>
      )}
      {state.selectedIndex === 1 ? (
        <Text bold color="green">
          ▶ Decrease two numbers
        </Text>
      ) : (
        <Text> Decrease two numbers</Text>
      )}
      {state.selectedIndex === 2 ? (
        <Text bold color="red">
          ▶ Exit
        </Text>
      ) : (
        <Text> Exit</Text>
      )}
      <Text> </Text>
      <Text dimColor>Use ↑/↓ to navigate, Enter to select</Text>
    </Box>
  );

  const renderInput = (title: string) => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
    >
      <Text bold color="cyan">
        {title}
      </Text>
      <Text> </Text>
      <Box flexDirection="column">
        <Text>
          {state.inputIndex === 0 ? '▶ ' : '  '}First number:{' '}
          {state.inputs[0] || '(empty)'}
        </Text>
        <Text>
          {state.inputIndex === 1 ? '▶ ' : '  '}Second number:{' '}
          {state.inputs[1] || '(empty)'}
        </Text>
      </Box>
      <Text> </Text>
      <Text dimColor>
        Type numbers, Tab/↑/↓ to switch, Enter to continue, Esc to go back
      </Text>
    </Box>
  );

  const getOperationSymbol = () => {
    if (state.operation === 'sum') return '+';
    if (state.operation === 'sub') return '-';
    return '';
  };

  const renderResult = () => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="green"
      padding={1}
    >
      <Text bold color="green">
        ╔══════════════════════╗
      </Text>
      <Text bold color="green">
        ║ Result ║
      </Text>
      <Text bold color="green">
        ╚══════════════════════╝
      </Text>
      <Text> </Text>
      <Text bold>
        {' '}
        {state.inputs[0]} {getOperationSymbol()} {state.inputs[1]} ={' '}
      </Text>
      <Text bold color="green">
        {' '}
        {state.result}
      </Text>
      <Text> </Text>
      <Text dimColor>Press any key to continue...</Text>
    </Box>
  );

  return (
    <Box flexDirection="column" padding={1}>
      {state.screen === 'menu' && renderMenu()}
      {state.screen === 'input-sum' && renderInput('SUM')}
      {state.screen === 'input-sub' && renderInput('DECREASE')}
      {state.screen === 'result' && renderResult()}
    </Box>
  );
};

export default App;
