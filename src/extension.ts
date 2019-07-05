// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ext } from './extensionVariables';
import { createTelemetryReporter, AzureUserInput, registerUIExtensionVariables, AzExtTreeDataProvider, IActionContext, AzExtTreeItem, registerCommand, createApiProvider, AzureTreeItem, openInPortal, registerEvent } from 'vscode-azureextensionui';
import { AzureAccountTreeItem } from './AzureAccountTreeItem';
import { SearchServiceTreeItem } from './SearchServiceTreeItem';
import { DocumentTreeItem } from './DocumentTreeItem';
import { DocumentEditor } from './DocumentEditor';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	ext.context = context;
	ext.reporter = createTelemetryReporter(context);
	ext.ui = new AzureUserInput(context.globalState);
	ext.outputChannel = vscode.window.createOutputChannel("Azure Search");
	context.subscriptions.push(ext.outputChannel);
	registerUIExtensionVariables(ext);

	const azureAccountTreeItem = new AzureAccountTreeItem();
	context.subscriptions.push(azureAccountTreeItem);
	ext.tree = new AzExtTreeDataProvider(azureAccountTreeItem, "azureSearch.loadMore");
	ext.treeView = vscode.window.createTreeView("azureSearch", { treeDataProvider: ext.tree });
	context.subscriptions.push(ext.treeView);

	const documentEditor = new DocumentEditor();
	context.subscriptions.push(documentEditor);

	registerCommand("azureSearch.refresh", async (_actionContext: IActionContext, treeItem?: AzExtTreeItem) => ext.tree.refresh(treeItem));
	registerCommand("azureSearch.loadMore", async (actionContext: IActionContext, treeItem: AzExtTreeItem) => await ext.tree.loadMore(treeItem, actionContext));
	registerCommand("azureSearch.selectSubscriptions", () => vscode.commands.executeCommand("azure-account.selectSubscriptions"));
	registerCommand("azureSearch.openInPortal", async (actionContext: IActionContext, treeItem?: AzureTreeItem) => {
		if (!treeItem) {
			treeItem = <SearchServiceTreeItem>await ext.tree.showTreeItemPicker(SearchServiceTreeItem.contextValue, actionContext);
		}

		// We retrieved the search service ARM object using the generic ARM client, not the Azure Search ARM client, which
		// somehow messes with the fullId relative to what treeItem.openInPortal() expects, so calling the underlying function
		// await treeItem.openInPortal();
		let id = (<SearchServiceTreeItem>treeItem).searchService.id;
		if (id !== undefined) {
			openInPortal(treeItem.root, id);
		}
	});
	registerCommand("azureSearch.openDocument", async (_actionContext: IActionContext, treeItem: DocumentTreeItem) => await documentEditor.showEditor(treeItem));

	registerEvent("azureSearch.searchDocument.onDidSaveTextDocument", 
				  vscode.workspace.onDidSaveTextDocument, 
				  async (_actionContext: IActionContext, doc: vscode.TextDocument) => await documentEditor.onDidSaveTextDocument(doc));


	return createApiProvider([]);
}

// this method is called when your extension is deactivated
export function deactivate() {}
