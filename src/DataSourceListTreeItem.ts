import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";

export class DataSourceListTreeItem extends SearchResourceListTreeItem {
    public static readonly contextValue: string = "azureSearchDataSourceList";
    public static readonly itemContextValue: string = "azureSearchDataSource";

    public constructor(parent: SearchServiceTreeItem, searchClient: SimpleSearchClient) {
        super(parent, 
              DataSourceListTreeItem.contextValue,
              DataSourceListTreeItem.itemContextValue,
              "Data Sources",
              SimpleSearchClient.DataSources,
              "data source",
              "azsds",
              searchClient);
    }
}
