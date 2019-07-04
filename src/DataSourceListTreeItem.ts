import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";

export class DataSourceListTreeItem extends AzureParentTreeItem {
    public static contextValue: string = "azureSearchDataSourceList";
    public readonly contextValue: string = DataSourceListTreeItem.contextValue;
    public label: string = "Data Sources";

    public constructor(
        parent: SearchServiceTreeItem,
        private readonly searchClient: SimpleSearchClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        // TODO: does the /datasources endpoint ever return a continuation link? I don't think so.
        let indexes: string[] = await this.searchClient.listDataSources();
        return indexes.map(i => new GenericTreeItem(this, { label: i, contextValue: "azureSearchDataSource" }));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
