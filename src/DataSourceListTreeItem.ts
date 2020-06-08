import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";
import { getResourcesPath } from "./constants";
import { Uri } from "vscode";
import * as path from 'path';

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

    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'light', 'datasource.svg'),
        dark: path.join(getResourcesPath(), 'dark', 'datasource.svg')
    };

}
