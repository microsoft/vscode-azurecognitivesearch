import { IResourceGroupWizardContext } from 'vscode-azureextensionui';

export interface ISearchServiceWizardContext extends IResourceGroupWizardContext {

    newServiceName?: string;
    sku?: string;
    partitionCount?: number
    replicaCount?: number
}