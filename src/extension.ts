// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ext } from './extensionVariables';
import { createTelemetryReporter, AzureUserInput, registerUIExtensionVariables, AzExtTreeDataProvider, IActionContext, AzExtTreeItem, registerCommand, createApiProvider, AzureTreeItem, openInPortal, registerEvent, DialogResponses } from 'vscode-azureextensionui';
import { AzureAccountTreeItem } from './AzureAccountTreeItem';
import { SearchServiceTreeItem } from './SearchServiceTreeItem';
import { DocumentTreeItem } from './DocumentTreeItem';
import { DocumentEditor } from './DocumentEditor';
import { DocumentListTreeItem } from './DocumentListTreeItem';
import { IndexTreeItem } from './IndexTreeItem';
import { SearchResultDocumentProvider } from './SearchResultDocumentProvider';
import { IDocumentRepository } from './IDocumentRepository';

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

	const searchResultDocumentProvider = new SearchResultDocumentProvider();
	vscode.workspace.registerTextDocumentContentProvider("search", searchResultDocumentProvider);

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
	registerCommand("azureSearch.openDocument", async (_actionContext: IActionContext, treeItem: IDocumentRepository) => await documentEditor.showEditor(treeItem));
    registerCommand("azureSearch.createDocument", async (actionContext: IActionContext, treeItem: DocumentListTreeItem) => {
		if (!treeItem) {
			treeItem = <DocumentListTreeItem>await ext.tree.showTreeItemPicker(DocumentListTreeItem.contextValue, actionContext);
		}

		const docItem = await treeItem.createChild(actionContext);
        await vscode.commands.executeCommand("azureSearch.openDocument", docItem);
	});
	registerCommand("azureSearch.deleteDocument", async  (actionContext: IActionContext, treeItem: DocumentTreeItem) => {
		if (!treeItem) {
			treeItem = <DocumentTreeItem>await ext.tree.showTreeItemPicker(DocumentTreeItem.contextValue, actionContext);
		}

		const r = await vscode.window.showWarningMessage("Are you sure you want to delete this document?", DialogResponses.deleteResponse, DialogResponses.cancel);
		if (r === DialogResponses.deleteResponse) {
			await treeItem.deleteTreeItem(actionContext);
		}
	});
	registerCommand("azureSearch.search", async (actionContext: IActionContext, treeItem: AzExtTreeItem) => {
		let indexItem = findSearchTarget(treeItem);

		if (!indexItem) {
			indexItem = <IndexTreeItem>await ext.tree.showTreeItemPicker(IndexTreeItem.contextValue, actionContext);
		}

		let query = await ext.ui.showInputBox({ placeHolder: "search=....&$filter=...", prompt: "Enter an Azure Search query string. You can use search, $filter, $top, etc." });
		const result = await indexItem.search(query);
		const id = searchResultDocumentProvider.registerContent(JSON.stringify(result, undefined, 4));
		const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(`search:${id}`));
		await vscode.window.showTextDocument(doc);
	});

	registerEvent("azureSearch.searchDocument.onDidSaveTextDocument", 
				  vscode.workspace.onDidSaveTextDocument, 
				  async (_actionContext: IActionContext, doc: vscode.TextDocument) => await documentEditor.onDidSaveTextDocument(doc));

	registerEvent("azureSearch.searchResults.onDidCloseTextDocument",
				  vscode.workspace.onDidCloseTextDocument,
				  async (_actionContext: IActionContext, doc: vscode.TextDocument) => { 
		if (doc.uri.scheme === "search") { 
			searchResultDocumentProvider.unregisterContent(doc.uri.path); 
		} 
	});

	return createApiProvider([]);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function findSearchTarget(treeItem: AzExtTreeItem) : IndexTreeItem | undefined {
	let indexItem: IndexTreeItem | undefined;
	
	if (treeItem && treeItem.contextValue === IndexTreeItem.contextValue) {
		indexItem = <IndexTreeItem>treeItem;
	}
	else {
		let selected = ext.treeView.selection && ext.treeView.selection.length > 0 ? ext.treeView.selection[0] : undefined;
		if (selected) {
			if (selected.contextValue === DocumentListTreeItem.contextValue) {
				indexItem = <IndexTreeItem>selected.parent;
			}
			else if (selected.contextValue === IndexTreeItem.contextValue) {
				indexItem = <IndexTreeItem>selected;
			}
		}
	}

	return indexItem;
}