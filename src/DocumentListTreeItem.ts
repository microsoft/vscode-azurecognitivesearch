import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { SimpleSearchClient, QueryResponse, Index, Field } from "./SimpleSearchClient";
import { IndexTreeItem } from "./IndexTreeItem";
import { DocumentTreeItem } from "./DocumentTreeItem";

export class DocumentListTreeItem extends AzureParentTreeItem {
    public static readonly contextValue: string = "azureSearchDocumentList";
    public readonly contextValue: string = DocumentListTreeItem.contextValue;
    public readonly label: string = "Documents";
    private nextLink?: string;
    private lastCount: number = 0;

    public constructor(
        parent: IndexTreeItem,
        private readonly searchClient: SimpleSearchClient,
        public readonly index: Index) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        let result: QueryResponse;
        let key: Field = <Field>this.index.fields.find(f => f.key);

        if (clearCache || !this.nextLink) {
            result = await this.searchClient.query(this.index.name, `$select=${key.name}`);
            this.lastCount = 0;
        }
        else {
            result = await this.searchClient.queryNext(this.nextLink);
        }   

        this.nextLink = result.nextLink;
        this.lastCount += result.value.length;

        return result.value.map((doc, i) => new DocumentTreeItem(this, this.searchClient, this.index, doc[key.name]));
    } 
    
    public hasMoreChildrenImpl(): boolean {
        return !!this.nextLink;
    }
}
