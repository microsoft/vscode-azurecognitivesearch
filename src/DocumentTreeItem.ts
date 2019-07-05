import { AzureTreeItem } from "vscode-azureextensionui";
import { SimpleSearchClient, QueryResponse, Index, Field } from "./SimpleSearchClient";
import { DocumentListTreeItem } from "./DocumentListTreeItem";

export class DocumentTreeItem extends AzureTreeItem {
    public static readonly contextValue: string = "azureSearchDocument";
    public readonly contextValue: string = DocumentTreeItem.contextValue;
    public readonly commandId: string = "azureSearch.openDocument";
    public readonly label: string;

    public constructor(
        parent: DocumentListTreeItem,
        private readonly searchClient: SimpleSearchClient,
        public readonly index: Index,
        public readonly key: any) {
        super(parent);
        this.label = key;
    }

    public get searchServiceName(): string {
        return this.searchClient.serviceName;
    }
    
    public async readContent() : Promise<any> {
        return await this.searchClient.lookup(this.index.name, this.key);
    }
}
