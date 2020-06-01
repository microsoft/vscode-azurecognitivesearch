// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ext } from './extensionVariables';
import { AzureUserInput, registerUIExtensionVariables, AzExtTreeDataProvider, IActionContext, AzExtTreeItem, registerCommand, createApiProvider, AzureTreeItem, openInPortal, registerEvent, DialogResponses, AzureParentTreeItem, createAzExtOutputChannel } from 'vscode-azureextensionui';
//import { createTelemetryReporter } from 'vscode-extension-telemetry';
import { AzureAccountTreeItem } from './AzureAccountTreeItem';
import { SearchServiceTreeItem } from './SearchServiceTreeItem';
import { DocumentTreeItem } from './DocumentTreeItem';
import { DocumentEditor } from './DocumentEditor';
import { DocumentListTreeItem } from './DocumentListTreeItem';
import { IndexTreeItem } from './IndexTreeItem';
import { SearchResultDocumentProvider } from './SearchResultDocumentProvider';
import { IDocumentRepository } from './IDocumentRepository';
import { DataSourceListTreeItem } from './DataSourceListTreeItem';
import { EditableResourceTreeItem } from './EditableResourceTreeItem';
import { IndexerListTreeItem } from './IndexerListTreeItem';
import { SkillsetListTreeItem } from './SkillSetListTreeItem';
import { SynonymMapListTreeItem } from './SynonymMapListTreeItem';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	ext.context = context;
	//ext.reporter = createTelemetryReporter(context);
	ext.ui = new AzureUserInput(context.globalState);
	ext.outputChannel = createAzExtOutputChannel("Azure Search", ext.prefix);
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
	registerCommand("azureSearch.openDocument", async (_actionContext: IActionContext, treeItem: IDocumentRepository) => await documentEditor.showEditor(treeItem));
    registerCommand("azureSearch.createDocument", async (actionContext: IActionContext, treeItem: DocumentListTreeItem) => createResource(treeItem, actionContext, DocumentListTreeItem.contextValue));
	registerCommand("azureSearch.deleteDocument", async  (actionContext: IActionContext, treeItem: DocumentTreeItem) => deleteResource(treeItem, actionContext, DocumentTreeItem.contextValue));
    registerCommand("azureSearch.createDataSource", async (actionContext: IActionContext, treeItem: DataSourceListTreeItem) => createResource(treeItem, actionContext, DataSourceListTreeItem.contextValue));
	registerCommand("azureSearch.deleteDataSource", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, DataSourceListTreeItem.itemContextValue));
    registerCommand("azureSearch.createIndexer", async (actionContext: IActionContext, treeItem: IndexerListTreeItem) => createResource(treeItem, actionContext, IndexerListTreeItem.contextValue));
	registerCommand("azureSearch.deleteIndexer", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, IndexerListTreeItem.itemContextValue));
    registerCommand("azureSearch.createSkillset", async (actionContext: IActionContext, treeItem: SkillsetListTreeItem) => createResource(treeItem, actionContext, SkillsetListTreeItem.contextValue));
	registerCommand("azureSearch.deleteSkillset", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, SkillsetListTreeItem.itemContextValue));
    registerCommand("azureSearch.createSynonymMap", async (actionContext: IActionContext, treeItem: SynonymMapListTreeItem) => createResource(treeItem, actionContext, SynonymMapListTreeItem.contextValue));
	registerCommand("azureSearch.deleteSynonymMap", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, SynonymMapListTreeItem.itemContextValue));
	registerCommand("azureSearch.search", async (actionContext: IActionContext, treeItem: AzExtTreeItem) => search(treeItem, actionContext, searchResultDocumentProvider));
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

	vscode.commands.registerTextEditorCommand("azureSearch.searchDoc", editor => searchToDocument(editor, azureAccountTreeItem, searchResultDocumentProvider));

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

async function createResource(treeItem: AzureParentTreeItem, actionContext: IActionContext, contextValue: string): Promise<void> {
	if (!treeItem) {
		treeItem = await ext.tree.showTreeItemPicker(contextValue, actionContext);
	}

	const item = await treeItem.createChild(actionContext);
	await vscode.commands.executeCommand("azureSearch.openDocument", item);
}

async function deleteResource(treeItem: AzExtTreeItem & IDocumentRepository, actionContext: IActionContext, contextValue: string): Promise<void> {
	if (!treeItem) {
		treeItem = await ext.tree.showTreeItemPicker(contextValue, actionContext);
	}

	const r = await vscode.window.showWarningMessage(`Are you sure you want to delete this ${treeItem.itemKind}?`, DialogResponses.deleteResponse, DialogResponses.cancel);
	if (r === DialogResponses.deleteResponse) {
		await treeItem.deleteTreeItem(actionContext);
	}
}

async function search(treeItem: AzExtTreeItem, actionContext: IActionContext, documentProvider: SearchResultDocumentProvider): Promise<void> {
	let indexItem = findSearchTarget(treeItem);

	if (!indexItem) {
		indexItem = <IndexTreeItem>await ext.tree.showTreeItemPicker(IndexTreeItem.contextValue, actionContext);
	}

	let query = await ext.ui.showInputBox({ placeHolder: "search=....&$filter=...", prompt: "Enter an Azure Search query string. You can use search, $filter, $top, etc." });
	const result = await indexItem.search(query);
	const id = documentProvider.registerContent(JSON.stringify(result, undefined, 4));
	const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(`search:${id}`));
	await vscode.window.showTextDocument(doc);
}

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

async function searchToDocument(editor: vscode.TextEditor, root: AzExtTreeItem, documentProvider: SearchResultDocumentProvider): Promise<void> {
		let text: string;
		if (editor.selection.isEmpty) {
			text = editor.document.lineAt(editor.selection.active.line).text;
		}
		else {
			text = editor.document.getText(new vscode.Range(editor.selection.start, editor.selection.end));
		}

		if (ext.treeView.selection.length === 0) {
			ext.ui.showWarningMessage("Select an Azure Search index from the left panel.");
			await ext.treeView.reveal(root, { expand: true });
		}
		else if (ext.treeView.selection[0].contextValue !== "azureSearchIndex") {
			ext.ui.showWarningMessage("Select an Azure Search index from the left panel.");
		}
		else {
			const indexItem = <IndexTreeItem>ext.treeView.selection[0];
			let result: any;
			try {
				result = await indexItem.search(text);
			}
			catch (error) {
				ext.ui.showWarningMessage(error.message);
			}
			const id = documentProvider.registerContent(JSON.stringify(result, undefined, 4));
			const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(`search:${id}`));
			await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
		}
	}