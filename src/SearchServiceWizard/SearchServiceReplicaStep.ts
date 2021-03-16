/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, IAzureQuickPickItem } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { ISearchServiceWizardContext } from './ISearchServiceWizardContext';

export class SearchServiceReplicaStep extends AzureWizardPromptStep<ISearchServiceWizardContext> {

    public async prompt(wizardContext: ISearchServiceWizardContext): Promise<void> {
        const placeHolder: string = "Select the replica count for your search service";

        if (wizardContext.sku === "free") {
            wizardContext.replicaCount = 1;
        } else {
            wizardContext.replicaCount = (await ext.ui.showQuickPick(this.getPicks(wizardContext), { placeHolder })).data;
        }
    }

    public shouldPrompt(wizardContext: ISearchServiceWizardContext): boolean {
        return wizardContext.replicaCount === undefined;
    }

    public async getPicks(wizardContext: ISearchServiceWizardContext): Promise<IAzureQuickPickItem<number>[]> {
        if (wizardContext.sku === "basic") {
            return [
                { label: "1", data: 1 },
                { label: "2", data: 2 },
                { label: "3", data: 3 }
            ];
        } else {
            return [
                { label: "1", data: 1 },
                { label: "2", data: 2 },
                { label: "3", data: 3 },
                { label: "4", data: 4 },
                { label: "5", data: 5 },
                { label: "6", data: 6 },
                { label: "7", data: 7 },
                { label: "8", data: 8 },
                { label: "9", data: 9 },
                { label: "10", data: 10 },
                { label: "11", data: 11 },
                { label: "12", data: 12 }
            ];
        }
        
    }
}