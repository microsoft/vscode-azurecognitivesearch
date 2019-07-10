import { AzureParentTreeItem, IActionContext, AzExtTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";

export class SkillsetTreeItem extends AzureParentTreeItem {
    public static contextValue: string = "azureSearchSkillsetList";
    public readonly contextValue: string = SkillsetTreeItem.contextValue;
    public label: string = "Skillsets";

    public constructor(
        parent: SearchServiceTreeItem,
        private readonly searchClient: SimpleSearchClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        // TODO: does the /skillsets endpoint ever return a continuation link? I don't think so.
        let skillsets: string[] = await this.searchClient.listSkillsets();
        return skillsets.map(i => new EditableResourceTreeItem(this, "azureSearchSkillset", `skillset-${i}--details`, i, "skillset", "azsskset",
                                                               () => this.searchClient.getResource("skillsets", i),
                                                               (content: any, etag?: string) => this.searchClient.updateResource("skillsets", i, content, etag)));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   
}
