import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient, Index } from "./SimpleSearchClient";
import { DocumentListTreeItem } from "./DocumentListTreeItem";
import { IndexListTreeItem } from "./IndexListTreeItem";
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";

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
        return [
            new EditableResourceTreeItem(this, "azureSearchIndexDetails", `${this.index.name}--details`, this.index.name, "index", "azsindex",
                                         () => this.searchClient.getResource("indexes", this.index.name),
                                         (content: any, etag?: string) => this.searchClient.updateResource("indexes", this.index.name, content, etag),
                                         "Index details"),
            new DocumentListTreeItem(this, this.searchClient, this.index)
        ];
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
