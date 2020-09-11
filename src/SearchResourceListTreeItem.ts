/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureParentTreeItem, IActionContext, AzExtTreeItem, ICreateChildImplContext } from "vscode-azureextensionui";
import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { EditableResourceTreeItem } from "./EditableResourceTreeItem";

export class SearchResourceListTreeItem extends AzureParentTreeItem {

    public constructor(
        parent: SearchServiceTreeItem,
        public readonly contextValue: string,
        public readonly itemContextValue: string,
        public readonly label: string,
        private readonly itemSet: string,
        private readonly itemKind: string,
        private readonly extension: string,
        private readonly searchClient: SimpleSearchClient) {
        super(parent);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        // TODO: do the non-search collections endpoints ever return a continuation link? I don't think so.
        let resources: string[] = await this.searchClient.listResources(this.itemSet);
        return resources.map(r => this.makeItem(r));
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

        return new EditableResourceTreeItem(this, this.itemContextValue, this.itemSet, name, this.itemKind, this.extension, creating, this.searchClient, label);
    }
}
