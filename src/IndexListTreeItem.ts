/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem, ICreateChildImplContext } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient, Index } from "./SimpleSearchClient";
import { IndexTreeItem } from "./IndexTreeItem";
import { getResourcesPath } from "./constants";
import { Uri } from "vscode";
import * as path from 'path';
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";

export class IndexListTreeItem extends AzureParentTreeItem {
    public static contextValue: string = "azureCognitiveSearchIndexList";
    public readonly contextValue: string = IndexListTreeItem.contextValue;
    public static readonly itemContextValue: string = "azureCognitiveSearchIndex";
    public static readonly itemSet: string = "indexes";
    public static readonly itemKind: string = "indexes";
    public static readonly extension: string = "azsindex";
    public label: string = "Indexes";

    public constructor(
        parent: SearchServiceTreeItem,
        private readonly searchClient: SimpleSearchClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        // TODO: does the /indexes endpoint ever return a continuation link? I don't think so.
        let indexes: Index[] = await this.searchClient.listIndexes();
        return indexes.map(i => new IndexTreeItem(this, this.searchClient, i));
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }   

    public async createChildImpl(context: ICreateChildImplContext): Promise<EditableResourceTreeItem> {
        return this.makeItem();
    }

    private makeItem(itemName?: string): EditableResourceTreeItem {
        const name = itemName || "new";
        const label = itemName ? undefined : "<new>";
        const creating = !itemName;

        return new EditableResourceTreeItem(this, IndexListTreeItem.itemContextValue, IndexListTreeItem.itemSet, name, IndexListTreeItem.itemKind, IndexListTreeItem.extension, creating, this.searchClient, label);
    }

    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'light', 'index.svg'),
        dark: path.join(getResourcesPath(), 'dark', 'index.svg')
    };
}
