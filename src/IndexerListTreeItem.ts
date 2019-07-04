import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";

export class IndexerListTreeItem extends AzureParentTreeItem {
    public static contextValue: string = "azureSearchIndexerList";
    public readonly contextValue: string = IndexerListTreeItem.contextValue;
    public label: string = "Indexers";

    public constructor(
        parent: SearchServiceTreeItem,
        private readonly searchClient: SimpleSearchClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        // TODO: does the /indexers endpoint ever return a continuation link? I don't think so.
        let indexes: string[] = await this.searchClient.listIndexers();
        return indexes.map(i => new GenericTreeItem(this, { label: i, contextValue: "azureSearchIndexer" }));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
