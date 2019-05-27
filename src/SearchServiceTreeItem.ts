import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { isNullOrUndefined } from "util";
import { SearchService } from "azure-arm-search/lib/models";
import SearchManagementClient from "azure-arm-search";

export class SearchServiceTreeItem extends AzureParentTreeItem {
    public static contextValue: string = "azureSearchService";
    public readonly contextValue: string = SearchServiceTreeItem.contextValue;
    public label: string = isNullOrUndefined(this.searchService.name) ? "InvalidSearchService" : this.searchService.name;

    public constructor(
        parent: AzureParentTreeItem,
        public readonly searchService: SearchService,
        public readonly searchManagementClient: SearchManagementClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        let items: AzExtTreeItem[] = [];
        items.push(new GenericTreeItem(this, { label: "Service details", contextValue: "azureSearchServiceDetails" }));
        items.push(new GenericTreeItem(this, { label: "Indexes", contextValue: "azureSearchIndexes" }));

        // TODO: Other pending subresources of search services
        // items.push(new GenericTreeItem(this, { label: "Synonym maps", contextValue: "azureSearchSynonymMaps" }));
        // items.push(new GenericTreeItem(this, { label: "Data Sources", contextValue: "azureSearchDataSources" }));
        // items.push(new GenericTreeItem(this, { label: "Indexers", contextValue: "azureSearchIndexers" }));
        // items.push(new GenericTreeItem(this, { label: "Skillsets", contextValue: "azureSearchSkillsets" }));
        return items;
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
