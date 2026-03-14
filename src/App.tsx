import React, { useState } from 'react';
import { useInput } from 'ink';
import { Box, Text } from 'ink';

type Screen = 'menu' | 'input-sum' | 'input-sub' | 'result';
type Operation = 'sum' | 'sub' | null;

interface AppState {
	screen: Screen;
	result?: number;
	selectedIndex: number;
	inputIndex: number;
	inputs: string[];
	operation: Operation;
}

const App: React.FC = () => {
	const [state, setState] = useState<AppState>({
		screen: 'menu',
		selectedIndex: 0,
		inputIndex: 0,
		inputs: ['', ''],
		operation: null,
	});

	const goToMenu = () => {
		setState({ screen: 'menu', selectedIndex: 0, inputIndex: 0, inputs: ['', ''], operation: null });
	};

	const goToInputSum = () => {
		setState({ screen: 'input-sum', selectedIndex: 0, inputIndex: 0, inputs: ['', ''], operation: 'sum' });
	};

	const goToInputSub = () => {
		setState({ screen: 'input-sub', selectedIndex: 0, inputIndex: 0, inputs: ['', ''], operation: 'sub' });
	};

	const calculateAndShowResult = (operation: 'sum' | 'sub') => {
		const a = parseFloat(state.inputs[0]) || 0;
		const b = parseFloat(state.inputs[1]) || 0;
		const result = operation === 'sum' ? a + b : a - b;
		setState({ ...state, screen: 'result', result, operation });
	};

	useInput((input: string, key: any) => {
		if (state.screen === 'menu') {
			if (key.upArrow) {
				setState((s: AppState) => ({ ...s, selectedIndex: (s.selectedIndex + 2) % 3 }));
			} else if (key.downArrow) {
				setState((s: AppState) => ({ ...s, selectedIndex: (s.selectedIndex + 1) % 3 }));
			} else if (key.return) {
				if (state.selectedIndex === 0) goToInputSum();
				else if (state.selectedIndex === 1) goToInputSub();
				else process.exit(0);
			}
		} else if (state.screen === 'input-sum' || state.screen === 'input-sub') {
			if (key.escape) {
				goToMenu();
				return;
			}
			if (key.upArrow || key.downArrow) {
				setState((s: AppState) => ({ ...s, inputIndex: s.inputIndex === 0 ? 1 : 0 }));
				return;
			}
			if (key.return) {
				if (state.inputIndex === 0) {
					setState((s: AppState) => ({ ...s, inputIndex: 1 }));
					return;
				}
				calculateAndShowResult(state.screen === 'input-sum' ? 'sum' : 'sub');
				return;
			}
			if (input === '0' || input === '1' || input === '2' || input === '3' || 
				input === '4' || input === '5' || input === '6' || input === '7' || 
				input === '8' || input === '9' || input === '.' || input === '-') {
				setState((s: AppState) => {
					const newInputs = [...s.inputs];
					newInputs[s.inputIndex] += input;
					return { ...s, inputs: newInputs };
				});
			}
			if (key.backspace || key.delete || input === '\b' || input === '\u007f') {
				setState((s: AppState) => {
					const newInputs = [...s.inputs];
					newInputs[s.inputIndex] = newInputs[s.inputIndex].slice(0, -1);
					return { ...s, inputs: newInputs };
				});
			}
		} else if (state.screen === 'result') {
			goToMenu();
		}
	});

	const renderMenu = () => (
		<Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
			<Text bold color="cyan">╔══════════════════════╗</Text>
			<Text bold color="cyan">║   Calculator Menu    ║</Text>
			<Text bold color="cyan">╚══════════════════════╝</Text>
			<Text>  </Text>
			{state.selectedIndex === 0 ? (
				<Text bold color="green">▶ Sum two numbers</Text>
			) : (
				<Text>  Sum two numbers</Text>
			)}
			{state.selectedIndex === 1 ? (
				<Text bold color="green">▶ Decrease two numbers</Text>
			) : (
				<Text>  Decrease two numbers</Text>
			)}
			{state.selectedIndex === 2 ? (
				<Text bold color="red">▶ Exit</Text>
			) : (
				<Text>  Exit</Text>
			)}
			<Text>  </Text>
			<Text dimColor>Use ↑/↓ to navigate, Enter to select</Text>
		</Box>
	);

	const renderInput = (title: string) => (
		<Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
			<Text bold color="cyan">{title}</Text>
			<Text>  </Text>
			<Box flexDirection="column">
				<Text>{state.inputIndex === 0 ? '▶ ' : '  '}First number: {state.inputs[0] || '(empty)'}</Text>
				<Text>{state.inputIndex === 1 ? '▶ ' : '  '}Second number: {state.inputs[1] || '(empty)'}</Text>
			</Box>
			<Text>  </Text>
			<Text dimColor>Type numbers, Tab/↑/↓ to switch, Enter to continue, Esc to go back</Text>
		</Box>
	);

	const getOperationSymbol = () => {
		if (state.operation === 'sum') return '+';
		if (state.operation === 'sub') return '-';
		return '';
	};

	const renderResult = () => (
		<Box flexDirection="column" borderStyle="round" borderColor="green" padding={1}>
			<Text bold color="green">╔══════════════════════╗</Text>
			<Text bold color="green">║       Result         ║</Text>
			<Text bold color="green">╚══════════════════════╝</Text>
			<Text>  </Text>
			<Text bold>  {state.inputs[0]} {getOperationSymbol()} {state.inputs[1]} = </Text>
			<Text bold color="green">  {state.result}</Text>
			<Text>  </Text>
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
