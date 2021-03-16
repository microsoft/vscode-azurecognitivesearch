/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import { SearchManagementClient, SearchManagementModels } from 'azure-arm-search';
import { nonNullProp } from '../utils/nonNull';
import { AzureWizardExecuteStep, createAzureClient } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { ISearchServiceWizardContext } from './ISearchServiceWizardContext';

export class SearchServiceCreateStep<T extends ISearchServiceWizardContext> extends AzureWizardExecuteStep<T> implements SearchServiceCreateStep<T> {
    public priority: number = 130;

    public constructor() {
        super();
    }

    public async execute(wizardContext: T): Promise<void> {
        const newServiceName: string = nonNullProp(wizardContext, 'newServiceName');
        const skuName: string = nonNullProp(wizardContext, 'sku');
        const locationName: string = nonNullProp(nonNullProp(wizardContext, 'location'), 'name');
        const rgName: string = nonNullProp(nonNullProp(wizardContext, 'resourceGroup'), 'name');
        const replicaCount: number = nonNullProp(wizardContext, 'replicaCount');
        const partitionCount: number = nonNullProp(wizardContext, 'partitionCount');

        const creatingSearchService: string = `Creating search serivce "${newServiceName}" in location "${locationName}" with sku "${skuName}"...`;
        ext.outputChannel.appendLog(creatingSearchService);
        const searchManagementClient: SearchManagementClient = createAzureClient(wizardContext, SearchManagementClient);

        const newSearchService: SearchManagementModels.SearchService = {
            sku: {name: skuName},
            replicaCount: replicaCount,
            partitionCount: partitionCount,
            location: locationName
        };

        wizardContext.searchService  = await searchManagementClient.services.beginCreateOrUpdate(rgName, newServiceName, newSearchService)


        const createdSearchService: string = `Successfully created search service "${newServiceName}".`;
        ext.outputChannel.appendLog(createdSearchService);
    }

    public shouldExecute(wizardContext: T): boolean {
        return !wizardContext.searchService;
    }
}