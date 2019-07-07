import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient, Index } from "./SimpleSearchClient";
import { DocumentListTreeItem } from "./DocumentListTreeItem";
import { IndexListTreeItem } from "./IndexListTreeItem";

export class IndexTreeItem extends AzureParentTreeItem {
    public static readonly contextValue: string = "azureSearchIndex";
    public readonly contextValue: string = IndexTreeItem.contextValue;
    public readonly label: string;

    public constructor(
        parent: IndexListTreeItem,
        private readonly searchClient: SimpleSearchClient,
        private readonly index: Index) {
        super(parent);
        this.label = index.name;
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        let items: AzExtTreeItem[] = [];
        items.push(new GenericTreeItem(this, { label: "Index details", contextValue: "azureSearchIndexDetails" }));
        items.push(new DocumentListTreeItem(this, this.searchClient, this.index));
        return items;
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async search(query: string): Promise<any> {
        return await this.searchClient.query(this.index.name, query, true);
    }

    public compareChildrenImpl(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
        return SearchServiceTreeItem.getTreeItemPosition(item1) - SearchServiceTreeItem.getTreeItemPosition(item2);
    }

    static getTreeItemPosition(item: AzExtTreeItem) : number {
        switch (item.contextValue) {
            case "azureSearchIndexDetails": return 1;
            case DocumentListTreeItem.contextValue: return 2;
        }

        return 0;
    }
}
