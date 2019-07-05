import Axios, { AxiosInstance, AxiosResponse } from "axios";
import { url } from "inspector";
import { URL } from "url";

export class SimpleSearchClient {
    private static readonly API_VERSION = "2019-05-06";

    public constructor(
        public readonly serviceName: string,
        private readonly apikey: string,
        private readonly cloudSuffix?: string | undefined) {
    }

    public async listIndexes() : Promise<Index[]> {
        let r = await this.httpGet<CollectionResponse<Index>>("indexes", "$select=name,fields");
        return r.data.value;
    }

    public async listDataSources(): Promise<string[]> {
        let r = await this.httpGet<CollectionResponse<NamedItem>>("datasources", "$select=name");
        return r.data.value.map(i => i.name);
    }

    public async listIndexers(): Promise<string[]> {
        let r = await this.httpGet<CollectionResponse<NamedItem>>("indexers", "$select=name");
        return r.data.value.map(i => i.name);
    }

    public async query(indexName: string, query: string) : Promise<QueryResponse> {
        let r = await this.httpGet(`indexes/${indexName}/docs`, query);
        this.fixupQueryResponse(r.data);
        return r.data;
    }

    public async queryNext(nextLink: string) : Promise<QueryResponse> {
        let r = await this.httpGetUrl(nextLink);
        this.fixupQueryResponse(r.data);
        return r.data;
    }

    public async lookup(indexName: string, key: string) : Promise<any> {
        const encodedKey = encodeURIComponent(key);
        let r = await this.httpGet(`indexes/${indexName}/docs/${encodedKey}`);
        return r.data;
    }

    public async updateDocument(indexName: string, doc: any) : Promise<void> {
        const shallowCopy = { ...doc };
        shallowCopy["@search.action"] = "merge";
        const batch = { value: [shallowCopy] };

        let batchResponse: CollectionResponse<BatchResponseEntry>;

        try {
            const r = await this.httpPost<CollectionResponse<BatchResponseEntry>>(`indexes/${indexName}/docs/index`, batch);
            batchResponse = r.data;
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
                throw new Error(`Failed to upload document: ${error.response.data.error.message}`);
            }

            throw new Error(`Error: ${error.message || "unknown error"}`);
        }

        if (batchResponse.value.length !== 1) {
            throw new Error("Unexpected response from service while attempting to save document");
        }

        if (!batchResponse.value[0].status) {
            throw new Error(`Failed to upload document: ${batchResponse.value[0].errorMessage}`);
        }
    }

    private fixupQueryResponse(response: any) {
        response.nextLink = response["@odata.nextLink"];
        response.nextPageParameteres = response["@search.nextPageParameters"];
    }

    private httpGet<T = any, R = AxiosResponse<T>>(path: string, queryString: string = "") : Promise<R> {
        return this.httpGetUrl(this.makeUrl(path, queryString));
    }

    private httpGetUrl<T = any, R = AxiosResponse<T>>(url: string) : Promise<R> {
        return Axios.get<T, R>(url, { headers: { "api-key": this.apikey } });
    }

    private httpPost<T = any, R = AxiosResponse<T>>(path: string, data: any) : Promise<R> {
        return Axios.post<T, R>(this.makeUrl(path), data, { headers: { "api-key": this.apikey } });
    }

    private makeUrl(path: string, options: string = "") : string {
        let suffix: string = this.cloudSuffix || "search.windows.net";
        if (options !== "" && options[0] !== "&") {
            options = "&" + options;
        }
        return `https://${this.serviceName}.${suffix}/${path}?api-version=${SimpleSearchClient.API_VERSION}${options}`;
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
