export interface IDocumentRepository {
    readonly namePrefix: string;

    readonly itemName: string;

    readonly itemKind: string;

    readContent(): Promise<{ content: any, etag?: string } | undefined>;

    updateContent(content: any, etag?: string): Promise<void>;
}
