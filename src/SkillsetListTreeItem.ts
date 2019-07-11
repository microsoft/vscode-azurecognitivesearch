import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";

export class SkillsetTreeItem extends SearchResourceListTreeItem {
    public static readonly contextValue: string = "azureSearchSkillsetList";

    public constructor(parent: SearchServiceTreeItem, searchClient: SimpleSearchClient) {
        super(parent,
             SkillsetTreeItem.contextValue,
             "azureSearchSkillset",
             "Skillsets",
             SimpleSearchClient.Skillsets,
             "skillset",
             "azsskset",
             searchClient);

    }
}
