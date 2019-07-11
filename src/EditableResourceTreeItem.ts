import { AzureTreeItem, AzureParentTreeItem, IActionContext } from "vscode-azureextensionui";
import { IDocumentRepository } from "./IDocumentRepository";
import { SimpleSearchClient } from "./SimpleSearchClient";

export class EditableResourceTreeItem extends AzureTreeItem implements IDocumentRepository {
    public readonly commandId: string = "azureSearch.openDocument";
    public readonly namePrefix: string;
    public label: string;

    public constructor(
        parent: AzureParentTreeItem,
        public readonly contextValue: string,
        public readonly itemSet: string,
        public itemName: string,
        public readonly itemKind: string,
        public readonly extension: string,
        private creating: boolean,
        private readonly searchClient: SimpleSearchClient,
        label?: string) {
        super(parent);
        this.namePrefix = `${itemSet}-${itemName}`;
        this.label = label || this.itemName;
    }

    public deleteTreeItemImpl?(_context: IActionContext): Promise<void> {
        return this.searchClient.deleteResource(this.itemSet, this.itemName);
    }

    async readContent(): Promise<{ content: any; etag?: string | undefined; } | undefined> {
        if (this.creating) {
            return undefined;
        }

        const r = await this.searchClient.getResource(this.itemSet, this.itemName);
        delete r.content["@odata.context"];
        delete r.content["@odata.etag"];
        
        return r;
    }

    async updateContent(content: any, etag?: string | undefined): Promise<void> {
        if (this.creating) {
            const created = await this.searchClient.createResource(this.itemSet, content);
            this.creating = false;
            this.itemName = created.content.name;
            this.label = created.content.name;
            this.refresh();
        }
        else {
            await this.searchClient.updateResource(this.itemSet, this.itemName, content, etag);
        }
    }
}