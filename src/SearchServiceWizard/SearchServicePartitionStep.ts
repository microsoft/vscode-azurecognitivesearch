/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, IAzureQuickPickItem } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { ISearchServiceWizardContext } from './ISearchServiceWizardContext';

export class SearchServicePartitionStep extends AzureWizardPromptStep<ISearchServiceWizardContext> {

    public async prompt(wizardContext: ISearchServiceWizardContext): Promise<void> {
        const placeHolder: string = "Select the partition count for your search service";

        if (wizardContext.sku === "free" || wizardContext.sku === "basic") {
            wizardContext.partitionCount = 1;
        } else {
            wizardContext.partitionCount = (await ext.ui.showQuickPick(this.getPicks(wizardContext), { placeHolder })).data;
        }
    }

    public shouldPrompt(wizardContext: ISearchServiceWizardContext): boolean {
        return wizardContext.partitionCount === undefined;
    }

    public async getPicks(wizardContext: ISearchServiceWizardContext): Promise<IAzureQuickPickItem<number>[]> {
        if (wizardContext.replicaCount && wizardContext.replicaCount <= 3) {
            return [
                { label: "1", data: 1 },
                { label: "2", data: 2 },
                { label: "3", data: 3 },
                { label: "4", data: 4 },
                { label: "6", data: 6 },
                { label: "12", data: 12 }
            ];
        } else if (wizardContext.replicaCount && wizardContext.replicaCount <= 4) {
            return [
                { label: "1", data: 1 },
                { label: "2", data: 2 },
                { label: "3", data: 3 },
                { label: "4", data: 4 },
                { label: "6", data: 6 }
            ];
        } else if (wizardContext.replicaCount && wizardContext.replicaCount <= 9) {
            return [
                { label: "1", data: 1 },
                { label: "2", data: 2 },
                { label: "3", data: 3 },
                { label: "4", data: 4 }
            ];
        } else {
            return [
                { label: "1", data: 1 },
                { label: "2", data: 2 },
                { label: "3", data: 3 }
            ];
        }
        
    }
}