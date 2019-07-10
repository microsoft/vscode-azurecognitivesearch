import { AzureParentTreeItem, IActionContext, AzExtTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";

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
        let indexers: string[] = await this.searchClient.listIndexers();
        return indexers.map(i => new EditableResourceTreeItem(this, "azureSearchIndexer", `indexer-${i}--details`, i, "indexer", "azsindexer",
                                                              () => this.searchClient.getResource("indexers", i),
                                                              (content: any, etag?: string) => this.searchClient.updateResource("indexers", i, content, etag)));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
