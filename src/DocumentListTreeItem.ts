/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureParentTreeItem, IActionContext, AzExtTreeItem, ICreateChildImplContext } from "vscode-azureextensionui";
import { SimpleSearchClient, QueryResponse, Index, Field } from "./SimpleSearchClient";
import { IndexTreeItem } from "./IndexTreeItem";
import { DocumentTreeItem } from "./DocumentTreeItem";
import { getResourcesPath } from "./constants";
import { Uri } from "vscode";
import * as path from 'path';

export class DocumentListTreeItem extends AzureParentTreeItem {
    public static readonly contextValue: string = "azureCognitiveSearchDocumentList";
    public readonly contextValue: string = DocumentListTreeItem.contextValue;
    public readonly label: string = "Documents";
    private nextLink?: string;

    public constructor(
        parent: IndexTreeItem,
        private readonly searchClient: SimpleSearchClient,
        public readonly index: Index) {
        super(parent);
    }

    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'light', 'docset.svg'),
        dark: path.join(getResourcesPath(), 'dark', 'docset.svg')
    };


    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        let result: QueryResponse;
        let key: Field = <Field>this.index.fields.find(f => f.key);

        if (clearCache || !this.nextLink) {
            result = await this.searchClient.query(this.index.name, `$select=${key.name}`);
        }
        else {
            result = await this.searchClient.queryNext(this.nextLink);
        }   

        this.nextLink = result.nextLink;

        return result.value.map((doc, i) => new DocumentTreeItem(this, this.searchClient, this.index, doc[key.name]));
    } 
    
    public hasMoreChildrenImpl(): boolean {
        return !!this.nextLink;
    }

    public async createChildImpl(context: ICreateChildImplContext): Promise<DocumentTreeItem> {
        return new DocumentTreeItem(this, this.searchClient, this.index, undefined);
    }
}
