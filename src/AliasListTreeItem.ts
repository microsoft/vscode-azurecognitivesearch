/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SearchServiceTreeItem } from "./SearchServiceTreeItem";
import { SimpleSearchClient } from "./SimpleSearchClient";
import { SearchResourceListTreeItem } from "./SearchResourceListTreeItem";
import { getResourcesPath } from "./constants";
import { Uri } from "vscode";
import * as path from 'path';

export class AliasListTreeItem extends SearchResourceListTreeItem {
    public static readonly contextValue: string = "azureCognitiveSearchAliasList";
    public static readonly itemContextValue: string = "azureCognitiveSearchAlias";

    public constructor(parent: SearchServiceTreeItem, searchClient: SimpleSearchClient) {
        super(parent,
              AliasListTreeItem.contextValue,
              AliasListTreeItem.itemContextValue,
              "Aliases",
              SimpleSearchClient.Aliases,
              "alias",
              "azsalias",
              searchClient);
    }

    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(getResourcesPath(), 'light', 'link.svg'),
        dark: path.join(getResourcesPath(), 'dark', 'link.svg')
    };

}
