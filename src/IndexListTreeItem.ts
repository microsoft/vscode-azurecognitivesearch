import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";

export class IndexListTreeItem extends AzureParentTreeItem {
    public static contextValue: string = "azureSearchIndexList";
    public readonly contextValue: string = IndexListTreeItem.contextValue;
    public label: string = "Indexes";

    public constructor(
        parent: SearchServiceTreeItem,
        private readonly searchClient: SimpleSearchClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        // TODO: does the /indexes endpoint ever return a continuation link? I don't think so.
        let indexes: string[] = await this.searchClient.listIndexes();
        return indexes.map(i => new GenericTreeItem(this, { label: i, contextValue: "azureSearchIndex" }));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
