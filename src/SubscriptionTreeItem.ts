import { SearchManagementClient }  from 'azure-arm-search';
import { ResourceManagementClient } from 'azure-arm-resource';
import { SearchService } from 'azure-arm-search/lib/models';
import { AzExtTreeItem, createAzureClient, SubscriptionTreeItemBase, addExtensionUserAgent } from 'vscode-azureextensionui';
import { SearchServiceTreeItem } from './SearchServiceTreeItem';

export class SubscriptionTreeItem extends SubscriptionTreeItemBase {
    private _nextLink: string | undefined;
    public childTypeLabel: string = "Search Service";

    async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        if (_clearCache) {
            this._nextLink = undefined;
        }

        // The pattern to follow is this:
        //      let searchManagementClient = createAzureClient(this.root, SearchManagementClient);
        // but SearchManagementClient defaults to an API version that the Search RP doesn't support. Will get that fixed.
        const searchManagementClient = new SearchManagementClient(this.root.credentials, this.root.subscriptionId, this.root.environment.resourceManagerEndpointUrl);
        searchManagementClient.apiVersion = "2015-02-28";
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
}
