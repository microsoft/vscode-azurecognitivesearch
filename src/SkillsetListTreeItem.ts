import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";

export class SkillsetListTreeItem extends SearchResourceListTreeItem {
    public static readonly contextValue: string = "azureSearchSkillsetList";
    public static readonly itemContextValue: string = "azureSearchSkillset";

    public constructor(parent: SearchServiceTreeItem, searchClient: SimpleSearchClient) {
        super(parent,
             SkillsetListTreeItem.contextValue,
             SkillsetListTreeItem.itemContextValue,
             "Skillsets",
             SimpleSearchClient.Skillsets,
             "skillset",
             "azsskset",
             searchClient);

    }
}
