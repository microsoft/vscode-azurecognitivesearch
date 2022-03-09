/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fse from "fs-extra";
import * as path from "path";
import * as os from "os";
import { ext } from './extensionVariables';
import { AzureUserInput, registerUIExtensionVariables, callWithTelemetryAndErrorHandling, AzExtTreeDataProvider, IActionContext, AzExtTreeItem, registerCommand, createApiProvider, AzureTreeItem, openInPortal, registerEvent, DialogResponses, AzureParentTreeItem, createAzExtOutputChannel, ITreeItemPickerContext } from 'vscode-azureextensionui';
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
import { IndexListTreeItem } from './IndexListTreeItem';
import { SkillsetListTreeItem } from './SkillsetListTreeItem';
import { SynonymMapListTreeItem } from './SynonymMapListTreeItem';
import { AliasListTreeItem } from './AliasListTreeItem';
import TelemetryReporter from 'vscode-extension-telemetry';
import { tree } from 'gulp';
import * as crypto from "crypto";
import { SubscriptionTreeItem } from './SubscriptionTreeItem';

function readJson(path: string) {
    const json = fs.readFileSync(path, "utf8");
    return JSON.parse(json);
}

function getRandomSuffix(): string {
	const buffer: Buffer = crypto.randomBytes(5);
	return buffer.toString('hex');
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activateInternal(context: vscode.ExtensionContext, perfStats: { loadStartTime: number; loadEndTime: number }) {

	ext.context = context;

	let reporter: TelemetryReporter | undefined;
    try {
        const { aiKey, name, version } = readJson(context.asAbsolutePath("./package.json"));
        reporter = new TelemetryReporter(name, version, aiKey);
        ext.reporter = reporter;
        context.subscriptions.push(reporter);
    } catch (error) {
	}
	
	ext.ui = new AzureUserInput(context.globalState);
	ext.outputChannel = createAzExtOutputChannel("Azure Cognitive Search", ext.prefix);
	context.subscriptions.push(ext.outputChannel);
	registerUIExtensionVariables(ext);

	await callWithTelemetryAndErrorHandling('azureCognitiveSearch.activate', async (activateContext: IActionContext) => {
		activateContext.telemetry.properties.isActivationEvent = 'true';
		activateContext.telemetry.measurements.mainFileLoad = (perfStats.loadEndTime - perfStats.loadStartTime) / 1000;

		const azureAccountTreeItem = new AzureAccountTreeItem();
		context.subscriptions.push(azureAccountTreeItem);
		ext.tree = new AzExtTreeDataProvider(azureAccountTreeItem, "azureCognitiveSearch.loadMore");
		ext.treeView = vscode.window.createTreeView("azureCognitiveSearch", { treeDataProvider: ext.tree });
		context.subscriptions.push(ext.treeView);
	
		const documentEditor = new DocumentEditor();
		context.subscriptions.push(documentEditor);

		const searchResultDocumentProvider = new SearchResultDocumentProvider();
		vscode.workspace.registerTextDocumentContentProvider("search", searchResultDocumentProvider);

		registerCommand("azureCognitiveSearch.refresh", async (_actionContext: IActionContext, treeItem?: AzExtTreeItem) => ext.tree.refresh(treeItem));
		registerCommand("azureCognitiveSearch.loadMore", async (actionContext: IActionContext, treeItem: AzExtTreeItem) => await ext.tree.loadMore(treeItem, actionContext));
		registerCommand("azureCognitiveSearch.selectSubscriptions", () => vscode.commands.executeCommand("azure-account.selectSubscriptions"));
		registerCommand("azureCognitiveSearch.openDocument", async (_actionContext: IActionContext, treeItem: IDocumentRepository) => await documentEditor.showEditor(treeItem));
		registerCommand("azureCognitiveSearch.createDocument", async (actionContext: IActionContext, treeItem: DocumentListTreeItem) => createResource(treeItem, actionContext, DocumentListTreeItem.contextValue));
		registerCommand("azureCognitiveSearch.deleteDocument", async  (actionContext: IActionContext, treeItem: DocumentTreeItem) => deleteResource(treeItem, actionContext, DocumentTreeItem.contextValue));
		registerCommand("azureCognitiveSearch.createDataSource", async (actionContext: IActionContext, treeItem: DataSourceListTreeItem) => createResource(treeItem, actionContext, DataSourceListTreeItem.contextValue));
		registerCommand("azureCognitiveSearch.deleteDataSource", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, DataSourceListTreeItem.itemContextValue));
		registerCommand("azureCognitiveSearch.createIndexer", async (actionContext: IActionContext, treeItem: IndexerListTreeItem) => createResource(treeItem, actionContext, IndexerListTreeItem.contextValue));
		registerCommand("azureCognitiveSearch.deleteIndexer", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, IndexerListTreeItem.itemContextValue));
		registerCommand("azureCognitiveSearch.createIndex", async (actionContext: IActionContext, treeItem: IndexListTreeItem) => createResource(treeItem, actionContext, IndexListTreeItem.contextValue));
		registerCommand("azureCognitiveSearch.deleteIndex", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, IndexListTreeItem.itemContextValue));
		registerCommand("azureCognitiveSearch.createSkillset", async (actionContext: IActionContext, treeItem: SkillsetListTreeItem) => createResource(treeItem, actionContext, SkillsetListTreeItem.contextValue));
		registerCommand("azureCognitiveSearch.deleteSkillset", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, SkillsetListTreeItem.itemContextValue));
		registerCommand("azureCognitiveSearch.createSynonymMap", async (actionContext: IActionContext, treeItem: SynonymMapListTreeItem) => createResource(treeItem, actionContext, SynonymMapListTreeItem.contextValue));
		registerCommand("azureCognitiveSearch.deleteSynonymMap", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, SynonymMapListTreeItem.itemContextValue));
		registerCommand("azureCognitiveSearch.createAlias", async (actionContext: IActionContext, treeItem: AliasListTreeItem) => createResource(treeItem, actionContext, AliasListTreeItem.contextValue));
		registerCommand("azureCognitiveSearch.deleteAlias", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => deleteResource(treeItem, actionContext, AliasListTreeItem.itemContextValue));

		registerCommand("azureCognitiveSearch.search", async (actionContext: IActionContext, treeItem: AzExtTreeItem) => search(treeItem, actionContext, searchResultDocumentProvider));
		registerCommand("azureCognitiveSearch.openSearchEditor", async (actionContext: IActionContext, treeItem: IndexTreeItem) => openSearchEditor(treeItem));
		registerCommand("azureCognitiveSearch.openInPortal", async (actionContext: IActionContext, treeItem?: AzureTreeItem) => {
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
		registerCommand("azureCognitiveSearch.resetIndexer", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => {
			if (!treeItem) {
				treeItem = await ext.tree.showTreeItemPicker(IndexerListTreeItem.itemContextValue, actionContext);
			}
			
			const r = await vscode.window.showWarningMessage(`Are you sure you want to reset ${treeItem.itemName} ${treeItem.itemKind}?`, DialogResponses.yes, DialogResponses.cancel);
			if (r === DialogResponses.yes) {
				await treeItem.resetIndexer(actionContext);
			}
		});
		registerCommand("azureCognitiveSearch.runIndexer", async  (actionContext: IActionContext, treeItem: EditableResourceTreeItem) => {
			if (!treeItem) {
				treeItem = await ext.tree.showTreeItemPicker(IndexerListTreeItem.contextValue, actionContext);
			}
			
			const r = await vscode.window.showWarningMessage(`Are you sure you want to run ${treeItem.itemName} ${treeItem.itemKind}?`, DialogResponses.yes, DialogResponses.cancel);
			if (r === DialogResponses.yes) {
				await treeItem.runIndexer(actionContext);
			}
		});
		registerCommand('azureCognitiveSearch.copyAdminKey', async (actionContext: IActionContext, node?: SearchServiceTreeItem ) => {
            const message = 'The primary admin key has been copied to the clipboard';
            if (!node) {
                node = await ext.tree.showTreeItemPicker<SearchServiceTreeItem>(SearchServiceTreeItem.contextValue, actionContext);
            }

            await copyAdminKey(node);
            vscode.window.showInformationMessage(message);
        });
		registerCommand('azureCognitiveSearch.copyQueryKey', async (actionContext: IActionContext, node?: SearchServiceTreeItem ) => {
            const message = 'The query key has been copied to the clipboard';
            if (!node) {
                node = await ext.tree.showTreeItemPicker<SearchServiceTreeItem>(SearchServiceTreeItem.contextValue, actionContext);
            }

            await copyQueryKey(node);
            vscode.window.showInformationMessage(message);
        });
		registerCommand('azureCognitiveSearch.createSearchService', async (actionContext: IActionContext, node?: SubscriptionTreeItem) => {
            if (!node) {
                node = await ext.tree.showTreeItemPicker<SubscriptionTreeItem>(SubscriptionTreeItem.contextValue, actionContext);
            }

            await node.createChild(actionContext);
        });
		registerCommand('azureCognitiveSearch.deleteSearchService', async (actionContext: IActionContext, node?: AzureTreeItem) => {
            const suppressCreateContext: ITreeItemPickerContext = actionContext;
            suppressCreateContext.suppressCreatePick = true;
            if (!node) {
                node = await ext.tree.showTreeItemPicker<AzureTreeItem>(SearchServiceTreeItem.contextValue, actionContext);
            }

			const r = await vscode.window.showWarningMessage(`Are you sure you want to delete the search service ${node.label}?`, DialogResponses.yes, DialogResponses.cancel);
			if (r === DialogResponses.yes) {
				await node.deleteTreeItem(actionContext);
			}
        });

		vscode.commands.registerTextEditorCommand("azureCognitiveSearch.searchDoc", editor => searchToDocument(editor, azureAccountTreeItem, searchResultDocumentProvider));

		registerEvent("azureCognitiveSearch.searchDocument.onDidSaveTextDocument", 
					vscode.workspace.onDidSaveTextDocument, 
					async (_actionContext: IActionContext, doc: vscode.TextDocument) => await documentEditor.onDidSaveTextDocument(doc));

		registerEvent("azureCognitiveSearch.searchResults.onDidCloseTextDocument",
					vscode.workspace.onDidCloseTextDocument,
					async (_actionContext: IActionContext, doc: vscode.TextDocument) => { 
						 _actionContext.telemetry.measurements.duration
			if (doc.uri.scheme === "search") { 
				searchResultDocumentProvider.unregisterContent(doc.uri.path); 
			} 
		});
	
	});

	return createApiProvider([]);
}

// this method is called when your extension is deactivated
export function deactivateInternal() {}

async function createResource(treeItem: AzureParentTreeItem, actionContext: IActionContext, contextValue: string): Promise<void> {
	if (!treeItem) {
		treeItem = await ext.tree.showTreeItemPicker(contextValue, actionContext);
	}

	const item = await treeItem.createChild(actionContext);
	await vscode.commands.executeCommand("azureCognitiveSearch.openDocument", item);
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

	let query = await ext.ui.showInputBox({ placeHolder: "search=....&$filter=...", prompt: "Enter an Azure Cognitive Search query string. You can use search, $filter, $top, etc." });
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

async function openSearchEditor(treeItem: IndexTreeItem): Promise<void> {
	const suffix = getRandomSuffix()
	const filename = "sandbox-" + suffix + ".azs";
	const localPath = path.join(os.tmpdir(), "vscode-azs-editor", filename);
	await fse.ensureFile(localPath);

	var template = "// Press ctrl+alt+r or cmd+option+r to search";
	template += "\n\n";
	template += "// You can send queries in the GET format\n";
	template += "search=*";
	template += "\n\n";
	template += "// You can also send queries in the POST format\n";
	template += "// Just be sure to highlight the entire request before searching\n";
	template += "{\n";
	template += "\t\"search\": \"*\"\n";
	template += "}";
	await fse.writeFile(localPath, template);

	const doc = await vscode.workspace.openTextDocument(localPath);
	vscode.languages.setTextDocumentLanguage(doc, "azurecognitivesearch");
	await vscode.window.showTextDocument(doc);

	ext.treeView.reveal(treeItem, {select: true})
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
			ext.ui.showWarningMessage("Select an Azure Cognitive Search index from the left panel.");
			await ext.treeView.reveal(root, { expand: true });
		}
		else if (ext.treeView.selection[0].contextValue !== "azureCognitiveSearchIndex") {
			ext.ui.showWarningMessage("Select an Azure Cognitive Search index from the left panel.");
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

	async function copyAdminKey(treeItem: SearchServiceTreeItem ): Promise<void> {
		let keys = await treeItem.getAdminKeys();
		await vscode.env.clipboard.writeText(<string>keys.primaryKey);
	}

	async function copyQueryKey(treeItem: SearchServiceTreeItem ): Promise<void> {
		let keys = await treeItem.getQueryKey();
		await vscode.env.clipboard.writeText(<string>keys.key);
	}