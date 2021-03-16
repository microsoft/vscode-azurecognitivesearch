/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SearchManagementClient }  from 'azure-arm-search';
import { CheckNameAvailabilityOutput } from 'azure-arm-search/lib/models';
import { AzureNameStep, createAzureClient, ResourceGroupListStep, resourceGroupNamingRules } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { ISearchServiceWizardContext } from './ISearchServiceWizardContext';

export class SearchServiceNameStep<T extends ISearchServiceWizardContext> extends AzureNameStep<T> {
    public async prompt(wizardContext: T): Promise<void> {
        const client: SearchManagementClient = createAzureClient(wizardContext, SearchManagementClient);

        const suggestedName: string | undefined = wizardContext.relatedNameTask ? await wizardContext.relatedNameTask : undefined;
        wizardContext.newServiceName = (await ext.ui.showInputBox({
            value: suggestedName,
            prompt: 'Enter a globally unique name for the new Search Service',
            validateInput: async (value: string): Promise<string | undefined> => await this.validateSearchServiceName(client, value)
        })).trim();
        if (!wizardContext.relatedNameTask) {
            wizardContext.relatedNameTask = this.generateRelatedName(wizardContext, wizardContext.newServiceName, resourceGroupNamingRules);
        }
    }

    public shouldPrompt(wizardContext: T): boolean {
        return !wizardContext.newServiceName;
    }

    protected async isRelatedNameAvailable(wizardContext: T, name: string): Promise<boolean> {
        return await ResourceGroupListStep.isNameAvailable(wizardContext, name);
    }

    private async validateSearchServiceName(client: SearchManagementClient, name: string): Promise<string | undefined> {
        name = name ? name.trim() : '';

        const nameAvailabilityResult: CheckNameAvailabilityOutput = await client.services.checkNameAvailability(name);
        if (!nameAvailabilityResult.isNameAvailable) {
            if (nameAvailabilityResult.message) {
                return nameAvailabilityResult.message;
            } else {
                return `Search service name "${name}" is not available`;
            }
            
        } else {
            return undefined;
        }
    }
}