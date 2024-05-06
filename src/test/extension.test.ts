import * as assert from 'assert';
import * as vscode from 'vscode';
import { extensionID, extensionPrefix } from '../constants';
// import * as extension from '../extension';

const getExtension = () => vscode.extensions.getExtension(extensionID);

suite('Extension Test Suite', () => {
	suiteTeardown(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('Test suite works', () => {
		assert.strictEqual(1, 1);
	});

	test('Extension is present', () => {
		assert.ok(getExtension());
	});

	test('Extension activates', async () => {
		const extension = getExtension();
		assert.doesNotThrow(extension!.activate);
		assert.doesNotReject(await extension!.activate());
	});

	test('Extension registers commands as per package.json', async () => {
		const extension = getExtension();
		await extension!.activate();
		const declaredCommands = extension!.packageJSON.contributes.commands;
		const registeredCommandsAll = await vscode.commands.getCommands(true);
		const registeredCommands = registeredCommandsAll.filter((id) => id.startsWith(`${extensionPrefix}.`));
		assert.ok(registeredCommands.length);
		assert.strictEqual(registeredCommands.length, declaredCommands.length);
	});
});
