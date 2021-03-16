/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, IAzureQuickPickItem } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { ISearchServiceWizardContext } from './ISearchServiceWizardContext';

export class SearchServiceSkuStep extends AzureWizardPromptStep<ISearchServiceWizardContext> {

    public async prompt(wizardContext: ISearchServiceWizardContext): Promise<void> {
        const placeHolder: string = "Select the SKU for your search service";
        wizardContext.sku = (await ext.ui.showQuickPick(this.getPicks(wizardContext), { placeHolder })).data;
    }

    public shouldPrompt(wizardContext: ISearchServiceWizardContext): boolean {
        return wizardContext.sku === undefined;
    }

    public async getPicks(wizardContext: ISearchServiceWizardContext): Promise<IAzureQuickPickItem<string>[]> {
        return [
            { label: "Free", data: "free" },
            { label: "Basic", data: "basic" },
            { label: "Standard", data: "standard" },
            { label: "Standard2", data: "standard2" },
            { label: "Standard3", data: "standard3" },
            { label: "StorageOptimized", data: "StorageOptimized" },
            { label: "StorageOptimized2", data: "StorageOptimized2" }
        ];
    }
}