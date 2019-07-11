import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";

export class SynonymMapTreeItem extends SearchResourceListTreeItem {
    public static readonly contextValue: string = "azureSearchSynonymMapList";

    public constructor(parent: SearchServiceTreeItem, searchClient: SimpleSearchClient) {
        super(parent,
              SynonymMapTreeItem.contextValue,
              "azureSearchSynonymMap",
              "Synonym Maps",
              SimpleSearchClient.SynonymMaps,
              "synonym map",
              "azssymmap",
              searchClient);
    }
}
