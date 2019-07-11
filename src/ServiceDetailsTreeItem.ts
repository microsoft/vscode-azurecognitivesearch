import { AzureTreeItem, AzureParentTreeItem } from "vscode-azureextensionui";
import { IDocumentRepository } from "./IDocumentRepository";
import { SearchService } from "azure-arm-search/lib/models";

export class ServiceDetailsTreeItem extends AzureTreeItem implements IDocumentRepository {
    public readonly commandId: string = "azureSearch.openDocument";
    public readonly contextValue: string = "azureSearchServiceDetails";
    public readonly label: string = "Service Details";
    public readonly namePrefix: string;
    readonly itemName: string;
    readonly itemKind: string = "service";
    readonly extension: string = "azssvc";

    public constructor(
        parent: AzureParentTreeItem,
        private readonly searchService: SearchService) {
        super(parent);
        this.itemName = searchService.name || "";
        this.namePrefix = `service-${searchService.name}`;
    }

    async readContent(): Promise<{ content: any; etag?: string | undefined; } | undefined> {
        return { content: this.searchService };
    }

    async updateContent(content: any, etag?: string | undefined): Promise<void> {
        throw new Error("Updating service details not supported.");
    }
}