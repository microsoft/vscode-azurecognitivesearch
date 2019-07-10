import { AzureTreeItem, AzureParentTreeItem } from "vscode-azureextensionui";
import { IDocumentRepository } from "./IDocumentRepository";

export class EditableResourceTreeItem extends AzureTreeItem implements IDocumentRepository {
    public readonly commandId: string = "azureSearch.openDocument";
    public readonly label: string;

    public constructor(
        parent: AzureParentTreeItem,
        public readonly contextValue: string,
        public readonly namePrefix: string,
        public readonly itemName: string,
        public readonly itemKind: string,
        public readonly extension: string,
        private readonly readImpl: () => Promise<{ content: any; etag?: string | undefined; } | undefined>,
        private readonly updateImpl: (content: any, etag?: string | undefined) => Promise<void>,
        label?: string) {
        super(parent);
        this.label = label || this.itemName;
    }

    readContent(): Promise<{ content: any; etag?: string | undefined; } | undefined> {
        return this.readImpl();
    }

    updateContent(content: any, etag?: string | undefined): Promise<void> {
        return this.updateImpl(content, etag);
    }
}