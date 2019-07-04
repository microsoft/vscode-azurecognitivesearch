import Axios, { AxiosInstance, AxiosResponse } from "axios";

export class SimpleSearchClient {
    private static readonly API_VERSION = "2019-05-06";

    public constructor(
        public readonly serviceName: string,
        private readonly apikey: string,
        private readonly cloudSuffix?: string | undefined) {
    }

    public async listIndexes() : Promise<string[]> {
        let r = await this.httpGet<IndexList>("indexes", "&$select=name");
        return r.data.value.map(i => i.name);
    }

    private httpGet<T = any, R = AxiosResponse<T>>(path: string, options: string = "") : Promise<R> {
        return Axios.get<T, R>(this.makeUrl(path, options), { headers: { "api-key": this.apikey } });
    }

    private makeUrl(path: string, options: string = "") : string {
        let suffix: string = this.cloudSuffix || "search.windows.net";
        return `https://${this.serviceName}.${suffix}/${path}?api-version=${SimpleSearchClient.API_VERSION}${options}`;
    }
}

interface Index {
    name: string;
}

interface IndexList {
    value: Index[];
}
