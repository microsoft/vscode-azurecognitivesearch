# Azure Cognitive Search for Visual Studio Code (Preview)

[![Build Status](https://delegenz.visualstudio.com/vs-code-pipelines/_apis/build/status/microsoft.vscode-azurecognitivesearch?branchName=master)](https://delegenz.visualstudio.com/vs-code-pipelines/_build/latest?definitionId=6&branchName=master)

[Azure Cognitive Search](https://docs.microsoft.com/azure/search/search-what-is-azure-search) is a search-as-a-service cloud solution that gives developers APIs and tools for adding a rich search experience over private, heterogeneous content in web, mobile, and enterprise applications.

This VS Code extension makes it easy to manage your search service with the full capabilities of the REST APIs while providing rich intellisense and snippets to make it easier to take advantage of the full range of capabilities. With the extension, you can create and update indexes and other components, add documents, search, and more. Check out the gifs and images below to see the extension in action.

## Features

### Browse all of your Azure Cognitive Search services

![Overview of the extension](resources/overview.png)

### Create new indexes, indexers, data sources, skillsets and synonym maps

![Create index demo](resources/create-index.gif)

### Take advantage of rich intellisense

![Rich intellisense](resources/intellisense.gif)

### Edit or delete indexes, indexers, data sources, skillsets and synonym maps

![Delete index](resources/delete-index.gif)

### Add or update documents in the search index

![Add of update documents](resources/add-document.gif)

### Query your search services

![Search an index](resources/search.gif)

## Get started

1. [Browse for Azure Cognitive Search](https://code.visualstudio.com/docs/editor/extension-gallery#_browse-for-extensions) in Extensions and install it.

1. On **View** > **Command palette**, scroll or type **Azure: Sign in**.

1. Select the  **Azure** button on the bottom left. You should get the list of installed Azure extensions on the right.

1. Expand **Cognitive Search**, your subscription, and your search service to access content. You need Contribute permissions or above to access the content.

To filter the subscriptions that show up in the extension's explorer, select **Select Subscriptions...** button on any subscription node (indicated by a filter icon when you hover over it), or select **View** > **Command palette** and search for **Azure: Select Subscriptions**. Note that the filter will apply to all VS Code extensions that support the [Azure Account and Sign-In](https://github.com/Microsoft/vscode-azure-account) extension.

If you don't have an Azure Account, you can sign up for one today for free and receive $200 in credits by selecting **Create a Free Azure Account...**" or selecting **View** > **Command palette** and searching for **Azure: Create an Account**.

To sign out, search for **Azure: Sign out** in **View** > **Command palette**.

## Contributing

There are several ways you can contribute to our [repo](https://github.com/dereklegenzoff/vscode-azuresearch):

* **Ideas, feature requests and bugs**: We are open to all ideas and we want to get rid of bugs! Use the [Issues](https://github.com/Microsoft/vscode-azurestorage/issues) section to report a new issue, provide your ideas or contribute to existing threads.
* **Documentation**: Found a typo or strangely worded sentences? Submit a PR!
* **Code**: Contribute bug fixes, features or design changes:
  * Clone the repository locally and open in VS Code.
  * Open the terminal (press `CTRL+`\`) and run `npm install`.
  * To build, press `F1` and type in `Tasks: Run Build Task`.
  * Debug: press `F5` to start debugging the extension.

### Legal

Before we can accept your pull request, you will need to sign a **Contribution License Agreement**. All you need to do is to submit a pull request, then the PR will get appropriately labelled (e.g. `cla-required`, `cla-norequired`, `cla-signed`, `cla-already-signed`). If you already signed the agreement, we will proceed with the PR, otherwise the system will tell you how you can sign the CLA. Once you sign the CLA, all future PR's will be labeled as `cla-signed`.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Telemetry

VS Code collects usage data and sends it to Microsoft to help improve our products and services. Read our [privacy statement](https://go.microsoft.com/fwlink/?LinkID=528096&clcid=0x409) to learn more. If you don't wish to send usage data to Microsoft, you can set the `telemetry.enableTelemetry` setting to `false`. Learn more in our [FAQ](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).

## License

[MIT](LICENSE.md)
