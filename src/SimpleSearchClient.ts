/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { appendExtensionUserAgent } from "vscode-azureextensionui";

export class SimpleSearchClient {
    private static readonly API_VERSION = "2021-04-30-Preview";
    private readonly userAgent: string;

    public static readonly DataSources: string = "datasources";
    public static readonly Indexers: string = "indexers";
    public static readonly Skillsets: string = "skillsets";
    public static readonly SynonymMaps: string = "synonymmaps";
    public static readonly Indexes: string = "indexes";
    public static readonly Aliases: string = "aliases";

    public constructor(
        public readonly serviceName: string,
        private readonly apikey: string,
        private readonly cloudSuffix?: string | undefined) {
        this.userAgent = appendExtensionUserAgent();
    }

    public async listIndexes() : Promise<Index[]> {
        let r = await this.httpGet<CollectionResponse<Index>>("indexes", "$select=name,fields");
        return r.data.value;
    }

    public async listResources(resource: string): Promise<string[]> {
        let r = await this.httpGet<CollectionResponse<NamedItem>>(resource, "$select=name");
        return r.data.value.map(i => i.name);
    }

    public async getResource(resource: string, name: string): Promise<{ content: any, etag: string }> {
        let r = await this.httpGet<any>(`${resource}/${name}`);
        return { content: r.data, etag: r.headers["etag"] };
    }

    public async createResource(resource: string, content: any): Promise<{ content: any, etag: any }> {
        let r = await this.httpPost(resource, content);
        return { content: r.data, etag: r.headers["etag"] }
    }

    public updateResource(resource: string, name: string, content: any, etag?: string): Promise<void> {
        return this.httpPut(`${resource}/${name}`, content, etag);
    }

    public deleteResource(resource: string, name: string): Promise<void> {
        return this.httpDelete(`${resource}/${name}`);
    }

    public async resetIndexer(resource: string, name: string): Promise<void> {
        return this.httpPost(`${resource}/${name}/reset`, null);
    }

    public async runIndexer(resource: string, name: string): Promise<void> {
        return this.httpPost(`${resource}/${name}/run`, null);
    }

    public async query(indexName: string, query: string, raw: boolean = false) : Promise<QueryResponse> {
        let r = await this.httpGet(`indexes/${indexName}/docs`, query);
        if (!raw) {
            this.fixupQueryResponse(r.data);
        }
        return r.data;
    }

    public async queryPost(indexName: string, query: string, raw: boolean = false) : Promise<QueryResponse> {
        let r = await this.httpPost(`indexes/${indexName}/docs/search`, JSON.parse(query));
        if (!raw) {
            this.fixupQueryResponse(r.data);
        }
        return r.data;
    }

    public async queryNext(nextLink: string) : Promise<QueryResponse> {
        let r = await this.httpGetUrl(nextLink);
        this.fixupQueryResponse(r.data);
        return r.data;
    }

    public async lookupDocument(indexName: string, key: string) : Promise<any> {
        const encodedKey = encodeURIComponent(key);
        let r = await this.httpGet(`indexes/${indexName}/docs/${encodedKey}`);
        return r.data;
    }

    public async uploadDocument(indexName: string, doc: any, createNew: boolean) : Promise<void> {
        const shallowCopy = { ...doc };
        shallowCopy["@search.action"] = createNew ? "mergeOrUpload" : "merge";
        const batch = { value: [shallowCopy] };

        await this.indexBatch(indexName, batch);
    }

    public async deleteDocument(indexName: string, keyName: string, key: any) : Promise<void> {
        const deletion: any = {};
        deletion["@search.action"] = "delete";
        deletion[keyName] = key;
        const batch = { value: [ deletion ] };

        await this.indexBatch(indexName, batch);
    }

    private async indexBatch(indexName: string, batch: { value: any }) : Promise<void> {
        let batchResponse: CollectionResponse<BatchResponseEntry>;

        try {
            const r = await this.httpPost<CollectionResponse<BatchResponseEntry>>(`indexes/${indexName}/docs/index`, batch);
            batchResponse = r.data;
        }
        catch (error) {
            throw new Error(`Failed to process document: ${this.extractErrorMessage(error)}`);
        }

        if (batchResponse.value.length !== 1) {
            throw new Error("Unexpected response from service while attempting to process document");
        }

        if (!batchResponse.value[0].status) {
            throw new Error(`Failed to process document: ${batchResponse.value[0].errorMessage}`);
        }
    }

    private extractErrorMessage(error: any): string | undefined {
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
            return error.response.data.error.message;
        }

        return `Error: ${error.message || error}`;
    }

    private fixupQueryResponse(response: any) {
        response.nextLink = response["@odata.nextLink"];
        response.nextPageParameteres = response["@search.nextPageParameters"];
    }

    private httpGet<T = any, R = AxiosResponse<T>>(path: string, queryString: string = "") : Promise<R> {
        return this.httpGetUrl(this.makeUrl(path, queryString));
    }

    private async httpGetUrl<T = any, R = AxiosResponse<T>>(url: string) : Promise<R> {
        try {
            return await Axios.get<T, R>(url, this.makeRequestConfig());
        }
        catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    private async httpPost<T = any, R = AxiosResponse<T>>(path: string, data: any) : Promise<R> {
        try {
            return await Axios.post<T, R>(this.makeUrl(path), data, this.makeRequestConfig());
        }
        catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    private async httpPut<T = any, R = AxiosResponse<T>>(path: string, data: any, etag?: string) : Promise<R> {
        try {
            const config = this.makeRequestConfig();
            if (etag) {
                config.headers["if-match"] = etag;
            }
            return await Axios.put<T, R>(this.makeUrl(path), data, config);
        }
        catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    private async httpDelete(path: string): Promise<void> {
        try {
            return await Axios.delete(this.makeUrl(path), this.makeRequestConfig());
        }
        catch (error) {
            throw new Error(this.extractErrorMessage(error));
        }
    }

    private makeUrl(path: string, options: string = "") : string {
        let suffix: string = this.cloudSuffix || "search.windows.net";
        if (options !== "" && options[0] !== "&") {
            options = "&" + options;
        }

        // Using the preview API for document operations
        return `https://${this.serviceName}.${suffix}/${path}?api-version=${SimpleSearchClient.API_VERSION}${options}`;
        
        
    }

    private makeRequestConfig(): AxiosRequestConfig {
        return { headers: { "api-key": this.apikey, "User-Agent": this.userAgent} };
    }
}

interface CollectionResponse<T> {
    value: T[];
}

interface NamedItem {
    name: string;
}

interface BatchResponseEntry {
    key: any;
    status: boolean;
    errorMessage: string;
    statusCode: number;
}

export interface QueryResponse {
    value: any[];
    nextLink?: string | undefined;
}

export interface Index {
    name: string;
    fields: Field[];
}

export interface Field {
    name: string;
    key: boolean;    
}
