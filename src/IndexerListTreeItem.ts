import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";

export class IndexerListTreeItem extends SearchResourceListTreeItem {
    public static readonly contextValue: string = "azureSearchIndexerList";

    public constructor(parent: SearchServiceTreeItem, searchClient: SimpleSearchClient) {
        super(parent,
            IndexerListTreeItem.contextValue,
            "azureSearchIndexer",
            "Indexers",
            SimpleSearchClient.Indexers,
            "indexer",
            "azsindexer",
            searchClient);
    }
}
