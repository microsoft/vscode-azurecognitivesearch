import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";

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
        let datasources: string[] = await this.searchClient.listDataSources();
        return datasources.map(i => new EditableResourceTreeItem(this, "azureSearchDataSource", "Data Source", `datasource-${i}--details`, i, "data source", "azsds",
                                                                 () => this.searchClient.getResource("datasources", i),
                                                                 (content: any, etag?: string) => this.searchClient.updateResource("datasources", i, content, etag)));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
