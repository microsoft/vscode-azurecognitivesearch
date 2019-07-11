import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { isNullOrUndefined } from "util";
import { SearchService } from "azure-arm-search/lib/models";
import SearchManagementClient from "azure-arm-search";
import { IndexListTreeItem } from "./IndexListTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { DataSourceListTreeItem } from "./DataSourceListTreeItem";
import { IndexerListTreeItem } from "./IndexerListTreeItem";
import { SynonymMapListTreeItem } from "./SynonymMapListTreeItem";
import { SkillsetListTreeItem } from "./SkillsetListTreeItem";

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

        // TODO: straight to dev hell for this, there's probably a way to include resource group name in resource listing
        const resourceGroup: string = (<string>this.searchService.id).split("/")[4];
        const name = <string>this.searchService.name;
        const keys = await this.searchManagementClient.adminKeys.get(resourceGroup, name);

        const searchClient = new SimpleSearchClient(name, <string>keys.primaryKey);

        return [
            new GenericTreeItem(this, { label: "Service details", contextValue: "azureSearchServiceDetails" }),
            new IndexListTreeItem(this, searchClient),
            new DataSourceListTreeItem(this, searchClient),
            new IndexerListTreeItem(this, searchClient),
            new SkillsetListTreeItem(this, searchClient),
            new SynonymMapListTreeItem(this, searchClient)
        ];
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public compareChildrenImpl(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
        return SearchServiceTreeItem.getTreeItemPosition(item1) - SearchServiceTreeItem.getTreeItemPosition(item2);
    }

    static getTreeItemPosition(item: AzExtTreeItem) : number {
        switch (item.contextValue) {
            case "azureSearchServiceDetails": return 1;
            case IndexListTreeItem.contextValue: return 2;
            case DataSourceListTreeItem.contextValue: return 3;
            case IndexerListTreeItem.contextValue: return 4;
            case SkillsetListTreeItem.contextValue: return 5;
            case SynonymMapListTreeItem.contextValue: return 6;
        }

        return 100;
    }
}
