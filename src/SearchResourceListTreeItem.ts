import { AzureParentTreeItem, IActionContext, AzExtTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";

export class SearchResourceListTreeItem extends AzureParentTreeItem {

    public constructor(
        parent: SearchServiceTreeItem,
        public readonly contextValue: string,
        public readonly itemContextValue: string,
        public readonly label: string,
        private readonly resource: string,
        private readonly itemKind: string,
        private readonly extension: string,
        private readonly searchClient: SimpleSearchClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        // TODO: do the non-search collections endpoints ever return a continuation link? I don't think so.
        let resources: string[] = await this.searchClient.listResources(this.resource);
        return resources.map(r => new EditableResourceTreeItem(this, this.itemContextValue, `${this.resource}-${r}`, r, this.itemKind, this.extension,
                                                               () => this.searchClient.getResource(this.resource, r),
                                                               (content: any, etag?: string) => this.searchClient.updateResource(this.resource, r, content, etag)));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
