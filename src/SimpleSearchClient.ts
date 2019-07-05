import Axios, { AxiosInstance, AxiosResponse } from "axios";

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
