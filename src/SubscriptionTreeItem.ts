/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SearchManagementClient, SearchManagementModels }  from 'azure-arm-search';
import { ResourceManagementClient } from 'azure-arm-resource';
import { SearchService, Sku } from 'azure-arm-search/lib/models';
import { AzExtTreeItem, AzureTreeItem, createAzureClient, SubscriptionTreeItemBase, addExtensionUserAgent,  AzureWizard, AzureWizardPromptStep, ICreateChildImplContext, ILocationWizardContext, ResourceGroupListStep, LocationListStep, StorageAccountCreateStep } from 'vscode-azureextensionui';
import { SearchServiceTreeItem } from './SearchServiceTreeItem';
import { getResourcesPath } from "./constants";
import { Uri } from "vscode";
import * as path from 'path';
import { ISearchServiceWizardContext } from './SearchServiceWizard/ISearchServiceWizardContext';
import { SearchServiceNameStep } from './SearchServiceWizard/SearchServiceNameStep';
import { nonNullProp } from './utils/nonNull';
import { SearchServiceSkuStep } from './SearchServiceWizard/SearchServiceSkuStep';
import { SearchServiceReplicaStep } from './SearchServiceWizard/SearchServiceReplicaStep';
import { SearchServicePartitionStep } from './SearchServiceWizard/SearchServicePartitionStep';
import { SearchServiceCreateStep } from './SearchServiceWizard/SearchServiceCreateStep';

export class SubscriptionTreeItem extends SubscriptionTreeItemBase {
    private _nextLink: string | undefined;
    public childTypeLabel: string = "Search Service";
    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'Subscriptions.svg'),
        dark: path.join(getResourcesPath(), 'Subscriptions.svg')
    };

    async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        if (_clearCache) {
            this._nextLink = undefined;
        }

        // The pattern to follow is this:
        //      let searchManagementClient = createAzureClient(this.root, SearchManagementClient);
        // but SearchManagementClient defaults to an API version that the Search RP doesn't support. Will get that fixed.
        const searchManagementClient = new SearchManagementClient(this.root.credentials, this.root.subscriptionId, this.root.environment.resourceManagerEndpointUrl);
        
        // This value can't be updated until we upgrade to @azure/arm-search as GET is no longer supported for ListQueryKeys in newer API versions and breaks azure-arm-search
        searchManagementClient.apiVersion = "2015-08-19";
        addExtensionUserAgent(searchManagementClient);

        const resourceManagementClient = createAzureClient(this.root, ResourceManagementClient.ResourceManagementClient);
        const services = !this._nextLink ?
            await resourceManagementClient.resources.list({ filter: "resourceType eq 'Microsoft.Search/searchServices'" }) :
            await resourceManagementClient.resources.listNext(this._nextLink);
        this._nextLink = services.nextLink;

        return this.createTreeItemsWithErrorHandling(
            services,
            'invalidSearchService',
            async (s: SearchService) => await new SearchServiceTreeItem(this, s, searchManagementClient),
            (s: SearchService) => s.name
        );
    }

    public hasMoreChildrenImpl(): boolean {
        return !!this._nextLink;
    }

    public async createChildImpl(context: ICreateChildImplContext ): Promise<AzureTreeItem> {
        const searchManagementClient = new SearchManagementClient(this.root.credentials, this.root.subscriptionId, this.root.environment.resourceManagerEndpointUrl);
        
        // This value can't be updated until we upgrade to @azure/arm-search as GET is no longer supported for ListQueryKeys in newer API versions and breaks azure-arm-search
        searchManagementClient.apiVersion = "2015-08-19";
        addExtensionUserAgent(searchManagementClient);

        const wizardContext: ISearchServiceWizardContext = Object.assign(context, this.root);

        const promptSteps: AzureWizardPromptStep<ISearchServiceWizardContext>[] = [
            new SearchServiceNameStep(),
            new ResourceGroupListStep(),
            new SearchServiceSkuStep(),
            new SearchServiceReplicaStep(),
            new SearchServicePartitionStep()
        ];
        LocationListStep.addStep(wizardContext, promptSteps);

        const wizard = new AzureWizard(wizardContext, {
            promptSteps,
            executeSteps: [new SearchServiceCreateStep()],
            title: 'Create new Azure Cognitive Search Service'
        });

        await wizard.prompt();

        const newServiceName: string = nonNullProp(wizardContext, 'newServiceName');
        context.showCreatingTreeItem(newServiceName);
        await wizard.execute();

        const newSearchService: SearchService = nonNullProp(wizardContext, 'searchService');

        return new SearchServiceTreeItem(this, newSearchService, searchManagementClient);
    }

}
