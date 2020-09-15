/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeItem, IActionContext } from "vscode-azureextensionui";
import { SimpleSearchClient, Index, Field } from "./SimpleSearchClient";
import { DocumentListTreeItem } from "./DocumentListTreeItem";
import { IDocumentRepository } from "./IDocumentRepository";
import { getResourcesPath } from "./constants";
import { Uri, Range } from "vscode";
import * as path from 'path';
import { EDOM } from "constants";

export class DocumentTreeItem extends AzureTreeItem implements IDocumentRepository {
    public static readonly contextValue: string = "azureCognitiveSearchDocument";
    public readonly contextValue: string = DocumentTreeItem.contextValue;
    public readonly commandId: string = "azureCognitiveSearch.openDocument";
    public label: string;
    readonly namePrefix: string;
    readonly itemName: string;
    readonly itemKind: string = "document";
    readonly extension: string = "json";

    public constructor(
        parent: DocumentListTreeItem,
        private readonly searchClient: SimpleSearchClient,
        public readonly index: Index,
        public key: any) {
        super(parent);
        this.label = key || "<new document>";
        this.namePrefix = `${this.searchServiceName}-${this.index.name}`;
        this.itemName = key;
    }

    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'light', 'document.svg'),
        dark: path.join(getResourcesPath(), 'dark', 'document.svg')
    };

    public get searchServiceName(): string {
        return this.searchClient.serviceName;
    }
    
    public async readContent(): Promise<{ content: any, etag?: string } | undefined> {
        // New doc being created in an editor
        if (!this.key) {
            var schema = await this.getSchema();

            return { content: schema, etag: undefined };
        }

        const c = await this.searchClient.lookupDocument(this.index.name, this.key);

        return { content: c, etag: undefined };
    }

    public async updateContent(doc: any, _etag?: string): Promise<void> {
        await this.searchClient.uploadDocument(this.index.name, doc, !this.key);

        if (!this.key) {
            const keyField = <Field>this.index.fields.find(f => f.key);
            this.key = doc[keyField.name];
            this.label = this.key;
            this.refresh();
        }
    }
    
    public async deleteTreeItemImpl?(_context: IActionContext): Promise<void> {
        if (this.key) {
            const keyField = <Field>this.index.fields.find(f => f.key);
            await this.searchClient.deleteDocument(this.index.name, keyField.name, this.key);
        }
    }

    private async getSchema(): Promise<string> {
        var indexSchema = await this.searchClient.getResource("indexes", this.index.name)
        
        var jsonSchema = this.mapFields(indexSchema.content.fields)

        return jsonSchema;
    }

    private mapFields(fields: Array<any>): any {

        var jsonSchema: any = {};
        for (let field of fields) {
            if (field.type == "Collection(Edm.ComplexType)") {
                jsonSchema[field.name] = [this.mapFields(field.fields)];
            }
            else if (field.type == "Edm.ComplexType") {
                jsonSchema[field.name] = this.mapFields(field.fields);
            }
            else if (field.type.includes("Collection")) {
                jsonSchema[field.name] = []; 
            }
            else if (field.type == "Edm.String") {
                jsonSchema[field.name] = ""; 
            }
            else if (field.type == "Edm.Boolean") {
                jsonSchema[field.name] = false; 
            }
            else if (field.type == "Edm.Int32" || field.type == "Edm.Int64") {
                jsonSchema[field.name] = 0; 
            }
            else if (field.type == "Edm.Double") {
                jsonSchema[field.name] = 0.0; 
            }
            else {
                jsonSchema[field.name] = null; 
            }
        }    
        return jsonSchema;  
    }
}
