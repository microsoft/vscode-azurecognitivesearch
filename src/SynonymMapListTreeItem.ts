import { AzureParentTreeItem, IActionContext, AzExtTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";

export class SynonymMapTreeItem extends AzureParentTreeItem {
    public static contextValue: string = "azureSearchSynonymMapList";
    public readonly contextValue: string = SynonymMapTreeItem.contextValue;
    public label: string = "Synonym Maps";

    public constructor(
        parent: SearchServiceTreeItem,
        private readonly searchClient: SimpleSearchClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        // TODO: does the /synoymmaps endpoint ever return a continuation link? I don't think so.
        let synonymMaps: string[] = await this.searchClient.listSynonymMaps();
        return synonymMaps.map(i => new EditableResourceTreeItem(this, "azureSearchSynonymMap", `synonymmap-${i}--details`, i, "synoynm map", "azssymmap",
                                                                 () => this.searchClient.getResource("synonymmaps", i),
                                                                 (content: any, etag?: string) => this.searchClient.updateResource("synonymmaps", i, content, etag)));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
