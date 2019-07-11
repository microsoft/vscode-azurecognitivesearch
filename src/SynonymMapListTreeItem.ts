import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";

export class SynonymMapListTreeItem extends SearchResourceListTreeItem {
    public static readonly contextValue: string = "azureSearchSynonymMapList";
    public static readonly itemContextValue: string = "azureSearchSynonymMap";

    public constructor(parent: SearchServiceTreeItem, searchClient: SimpleSearchClient) {
        super(parent,
              SynonymMapListTreeItem.contextValue,
              SynonymMapListTreeItem.itemContextValue,
              "Synonym Maps",
              SimpleSearchClient.SynonymMaps,
              "synonym map",
              "azssymmap",
              searchClient);
    }
}
