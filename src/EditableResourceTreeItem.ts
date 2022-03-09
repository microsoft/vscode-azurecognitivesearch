/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeItem, AzureParentTreeItem, IActionContext } from "vscode-azureextensionui";
import { IDocumentRepository } from "./IDocumentRepository";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { getResourcesPath } from "./constants";
import { Uri } from "vscode";
import * as path from 'path';

export class EditableResourceTreeItem extends AzureTreeItem implements IDocumentRepository {
    public readonly commandId: string = "azureCognitiveSearch.openDocument";
    public readonly namePrefix: string;
    public label: string;

    public constructor(
        parent: AzureParentTreeItem,
        public readonly contextValue: string,
        public readonly itemSet: string,
        public itemName: string,
        public readonly itemKind: string,
        public readonly extension: string,
        private creating: boolean,
        private readonly searchClient: SimpleSearchClient,
        label?: string) {
        super(parent);
        this.namePrefix = `${itemSet}-${itemName}`;
        this.label = label || this.itemName;

        if (itemKind === "indexer") {
            this.iconPath = {
                light: path.join(getResourcesPath(), 'light', 'indexer.svg'),
                dark: path.join(getResourcesPath(), 'dark', 'indexer.svg')
            };
        } else if (itemKind === "data source") {
            this.iconPath = {
                light: path.join(getResourcesPath(), 'light', 'datasource.svg'),
                dark: path.join(getResourcesPath(), 'dark', 'datasource.svg')
            };
        } else if (itemKind === "skillset") {
            this.iconPath = {
                light: path.join(getResourcesPath(), 'light', 'skillset.svg'),
                dark: path.join(getResourcesPath(), 'dark', 'skillset.svg')
            };
        } else if (itemKind === "synonym map") {
            this.iconPath = {
                light: path.join(getResourcesPath(), 'light', 'synonyms.svg'),
                dark: path.join(getResourcesPath(), 'dark', 'synonyms.svg')
            };
        } 
        else if (itemKind === "index") {
            this.iconPath = {
                light: path.join(getResourcesPath(), 'light', 'info.svg'),
                dark: path.join(getResourcesPath(), 'dark', 'info.svg')
            };
        } 
        else if (itemKind === "alias") {
            this.iconPath = {
                light: path.join(getResourcesPath(), 'light', 'link.svg'),
                dark: path.join(getResourcesPath(), 'dark', 'link.svg')
            };
        } 
    }

    public deleteTreeItemImpl?(_context: IActionContext): Promise<void> {
        return this.searchClient.deleteResource(this.itemSet, this.itemName);
    }

    public resetIndexer(_context: IActionContext): Promise<void> {
        return this.searchClient.resetIndexer(this.itemSet, this.itemName);
    }

    public runIndexer(_context: IActionContext): Promise<void> {
        return this.searchClient.runIndexer(this.itemSet, this.itemName);
    }

    async readContent(): Promise<{ content: any; etag?: string | undefined; } | undefined> {
        if (this.creating) {
            return undefined;
        }

        const r = await this.searchClient.getResource(this.itemSet, this.itemName);
        delete r.content["@odata.context"];
        delete r.content["@odata.etag"];
        
        return r;
    }

    async updateContent(content: any, etag?: string | undefined): Promise<void> {
        if (this.creating) {
            const created = await this.searchClient.createResource(this.itemSet, content);
            this.creating = false;
            this.itemName = created.content.name;
            this.label = created.content.name;

            // refreshing the parent to get index properly added to tree
            if (this.itemKind === "indexes")
            {
                this.parent?.refresh();
            }
            else
            {
                this.refresh();
            }
            
        }
        else {
            await this.searchClient.updateResource(this.itemSet, this.itemName, content, etag);
        }
    }
}