import { AzureTreeItem, IActionContext } from "vscode-azureextensionui";
import { SimpleSearchClient, Index, Field } from "./SimpleSearchClient";
import { DocumentListTreeItem } from "./DocumentListTreeItem";
import { IDocumentRepository } from "./IDocumentRepository";

export class DocumentTreeItem extends AzureTreeItem implements IDocumentRepository {
    public static readonly contextValue: string = "azureSearchDocument";
    public readonly contextValue: string = DocumentTreeItem.contextValue;
    public readonly commandId: string = "azureSearch.openDocument";
    public label: string;
    readonly namePrefix: string;
    readonly itemName: string;
    readonly itemKind: string = "document";
    readonly extension: string = "json";

    public constructor(
        parent: DocumentListTreeItem,
        private readonly searchClient: SimpleSearchClient,
        public readonly index: Index,
        public key: any) {
        super(parent);
        this.label = key || "<new document>";
        this.namePrefix = `${this.searchServiceName}-${this.index.name}`;
        this.itemName = key;
    }

    public get searchServiceName(): string {
        return this.searchClient.serviceName;
    }
    
    public async readContent(): Promise<{ content: any, etag?: string } | undefined> {
        // New doc being created in an editor
        if (!this.key) {
            return undefined;
        }

        const c = await this.searchClient.lookupDocument(this.index.name, this.key);

        return { content: c, etag: undefined };
    }

    public async updateContent(doc: any, _etag?: string): Promise<void> {
        await this.searchClient.uploadDocument(this.index.name, doc, !this.key);

        if (!this.key) {
            const keyField = <Field>this.index.fields.find(f => f.key);
            this.key = doc[keyField.name];
            this.label = this.key;
            this.refresh();
        }
    }
    
    public async deleteTreeItemImpl?(_context: IActionContext): Promise<void> {
        if (this.key) {
            const keyField = <Field>this.index.fields.find(f => f.key);
            await this.searchClient.deleteDocument(this.index.name, keyField.name, this.key);
        }
    }
}
