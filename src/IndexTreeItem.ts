/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient, Index } from "./SimpleSearchClient";
import { DocumentListTreeItem } from "./DocumentListTreeItem";
import { IndexListTreeItem } from "./IndexListTreeItem";
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";
import * as path from 'path';
import { Uri } from "vscode";
import { getResourcesPath } from "./constants";

export class IndexTreeItem extends AzureParentTreeItem {
    public static readonly contextValue: string = "azureCognitiveSearchIndex";
    public readonly contextValue: string = IndexTreeItem.contextValue;
    public readonly label: string;
    public readonly itemKind: string = "index";

    public constructor(
        parent: IndexListTreeItem,
        private readonly searchClient: SimpleSearchClient,
        private readonly index: Index) {
        super(parent);
        this.label = index.name;
    }

    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'light', 'index.svg'),
        dark: path.join(getResourcesPath(), 'dark', 'index.svg')
    };

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        return [
            new EditableResourceTreeItem(this, "azureCognitiveSearchIndexDetails", "indexes", this.index.name, "index", "azsindex", false, this.searchClient, "Index Details"),
            new DocumentListTreeItem(this, this.searchClient, this.index)
        ];
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async search(query: string): Promise<any> {
        if (query.indexOf("{") > -1 && query.trim().indexOf("{") < 5) {
            return await this.searchClient.queryPost(this.index.name, query, true);
        } else {
            return await this.searchClient.query(this.index.name, query, true);
        }
        
    }

    public compareChildrenImpl(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
        return SearchServiceTreeItem.getTreeItemPosition(item1) - SearchServiceTreeItem.getTreeItemPosition(item2);
    }

    public deleteTreeItemImpl?(_context: IActionContext): Promise<void> {
        return this.searchClient.deleteResource('indexes', this.label);
    }

    static getTreeItemPosition(item: AzExtTreeItem) : number {
        switch (item.contextValue) {
            case "azureCognitiveSearchIndexDetails": return 1;
            case DocumentListTreeItem.contextValue: return 2;
        }

        return 0;
    }
}
