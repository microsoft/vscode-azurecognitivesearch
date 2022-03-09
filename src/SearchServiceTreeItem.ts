/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureParentTreeItem, IActionContext, AzExtTreeItem, GenericTreeItem } from "vscode-azureextensionui";
import { isNullOrUndefined } from "util";
import { AdminKeyResult, QueryKey, SearchService } from "azure-arm-search/lib/models";
import SearchManagementClient from "azure-arm-search";
import { IndexListTreeItem } from "./IndexListTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { DataSourceListTreeItem } from "./DataSourceListTreeItem";
import { IndexerListTreeItem } from "./IndexerListTreeItem";
import { SynonymMapListTreeItem } from "./SynonymMapListTreeItem";
import { AliasListTreeItem } from "./AliasListTreeItem";
import { SkillsetListTreeItem } from "./SkillsetListTreeItem";
import { ServiceDetailsTreeItem } from "./ServiceDetailsTreeItem";
import { getResourcesPath } from "./constants";
import * as crypto from "crypto";
import { Uri } from "vscode";
import * as path from 'path';

export class SearchServiceTreeItem extends AzureParentTreeItem {
    public static contextValue: string = "azureCognitiveSearchService";
    public readonly contextValue: string = SearchServiceTreeItem.contextValue;
    public label: string = isNullOrUndefined(this.searchService.name) ? "InvalidSearchService" : this.searchService.name;
    public resourceGroup: string;
    public name: string;

    public constructor(
        parent: AzureParentTreeItem,
        public readonly searchService: SearchService,
        public readonly searchManagementClient: SearchManagementClient) {

        super(parent);
        this.resourceGroup = (<string>this.searchService.id).split("/")[4];
        this.name = <string>this.searchService.name;
    }

    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'Azure-Search.svg'),
        dark: path.join(getResourcesPath(), 'Azure-Search.svg')
    };

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        
        const keys = await this.getAdminKeys();
        const searchClient = new SimpleSearchClient(this.name, <string>keys.primaryKey);

        return [
            new ServiceDetailsTreeItem(this, this.searchService),
            new IndexListTreeItem(this, searchClient),
            new DataSourceListTreeItem(this, searchClient),
            new IndexerListTreeItem(this, searchClient),
            new SkillsetListTreeItem(this, searchClient),
            new SynonymMapListTreeItem(this, searchClient),
            new AliasListTreeItem(this, searchClient)
        ];
    }    
    
    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public compareChildrenImpl(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
        return SearchServiceTreeItem.getTreeItemPosition(item1) - SearchServiceTreeItem.getTreeItemPosition(item2);
    }

    static getTreeItemPosition(item: AzExtTreeItem) : number {
        switch (item.contextValue) {
            case "azureCognitiveSearchServiceDetails": return 1;
            case IndexListTreeItem.contextValue: return 2;
            case DataSourceListTreeItem.contextValue: return 3;
            case IndexerListTreeItem.contextValue: return 4;
            case SkillsetListTreeItem.contextValue: return 5;
            case SynonymMapListTreeItem.contextValue: return 6;
            case AliasListTreeItem.contextValue: return 7;
        }

        return 100;
    }

    public async getAdminKeys(): Promise<AdminKeyResult> {
        const keys = await this.searchManagementClient.adminKeys.get(this.resourceGroup, this.name);
        return keys;
    }

    public async createQueryKey(): Promise<QueryKey> {
        const keyName = "vscode-" + this.getRandomSuffix();
        const key = await this.searchManagementClient.queryKeys.create(this.resourceGroup, this.name, keyName);
        return key;
    }

    public async getQueryKey(): Promise<QueryKey> {
        const keys = await this.searchManagementClient.queryKeys.listBySearchService(this.resourceGroup, this.name);
        if (keys.length === 0) {
            return this.createQueryKey();
        } else {
            return keys[0];
        }
    }

    public async deleteTreeItemImpl(): Promise<void> {
        await this.searchManagementClient.services.deleteMethod(this.resourceGroup, this.name);
    }

    private getRandomSuffix(): string {
        const buffer: Buffer = crypto.randomBytes(5);
        return buffer.toString('hex');
    }
}
