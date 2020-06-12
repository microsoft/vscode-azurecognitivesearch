import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";
import { getResourcesPath } from "./constants";
import { Uri } from "vscode";
import * as path from 'path';

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

    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'light', 'skillset.svg'),
        dark: path.join(getResourcesPath(), 'dark', 'skillset.svg')
    };
}
