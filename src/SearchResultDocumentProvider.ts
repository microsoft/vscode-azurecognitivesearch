/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";

export class SearchResultDocumentProvider implements vscode.TextDocumentContentProvider {
    private contentMap: { [key: string]: string } = {};
    private id: number = 0;

    public registerContent(content: string) : string {
        const key = `${this.id++}.json`;
        this.contentMap[key] = content;
        return key;
    }

    public unregisterContent(id: string) : void {
        delete this.contentMap[id];
    }

    public provideTextDocumentContent(uri: vscode.Uri) : string {
        const path: string = uri.path;
        return this.contentMap[path];
    }
}
