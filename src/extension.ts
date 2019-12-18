import * as vscode from 'vscode';
import { UmiTaskView } from './treeDataProvider/treeDataProvider';

export function activate(context: vscode.ExtensionContext) {
  new UmiTaskView(context);
}

export function deactivate() {}
