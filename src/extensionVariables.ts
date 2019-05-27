import { ExtensionContext, OutputChannel, TreeView } from "vscode";
import { AzExtTreeDataProvider, AzExtTreeItem, IAzureUserInput, ITelemetryReporter } from "vscode-azureextensionui";

export namespace ext {
    export let context: ExtensionContext;
    export let outputChannel: OutputChannel;
    export let ui: IAzureUserInput;
    export let reporter: ITelemetryReporter;

    export let tree: AzExtTreeDataProvider;
    export let treeView: TreeView<AzExtTreeItem>;
}
