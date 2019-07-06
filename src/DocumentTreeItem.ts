import { AzureTreeItem } from "vscode-azureextensionui";
import { SimpleSearchClient, QueryResponse, Index, Field } from "./SimpleSearchClient";
import { DocumentListTreeItem } from "./DocumentListTreeItem";

export class DocumentTreeItem extends AzureTreeItem {
    public static readonly contextValue: string = "azureSearchDocument";
    public readonly contextValue: string = DocumentTreeItem.contextValue;
    public readonly commandId: string = "azureSearch.openDocument";
    public label: string;

    public constructor(
        parent: DocumentListTreeItem,
        private readonly searchClient: SimpleSearchClient,
        public readonly index: Index,
        public key: any) {
        super(parent);
        this.label = key || "<new document>";
    }

    public get searchServiceName(): string {
        return this.searchClient.serviceName;
    }
    
    public async readContent() : Promise<any> {
        // New doc being created in an editor
        if (!this.key) {
            return {};
        }

        return await this.searchClient.lookup(this.index.name, this.key);
    }

    public async updateContent(doc: any) : Promise<void> {
        await this.searchClient.uploadDocument(this.index.name, doc, !this.key);

        if (!this.key) {
            const keyField = <Field>this.index.fields.find(f => f.key);
            this.key = doc[keyField.name];
            this.label = this.key;
            this.refresh();
        }
    }
}
