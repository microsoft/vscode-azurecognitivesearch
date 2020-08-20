# Azure Cognitive Search for Visual Studio Code (Preview)

[![Build Status](https://delegenz.visualstudio.com/vs-code-pipelines/_apis/build/status/dereklegenzoff.vscode-azuresearch?branchName=master)](https://delegenz.visualstudio.com/vs-code-pipelines/_build/latest?definitionId=5&branchName=master)

[Azure Cognitive Search](https://docs.microsoft.com/en-us/azure/search/search-what-is-azure-search) (formerly known as "Azure Search") is a search-as-a-service cloud solution that gives developers APIs and tools for adding a rich search experience over private, heterogeneous content in web, mobile, and enterprise applications.

This VS Code extension makes it easy to manage your search service, create and update indexes and other components, add documents, send queries, and more.

## Features

* Browse Azure Cognitive Search services
* Inspect service details including replicas, partitions, etc.
* List indexes in each service
* Create new indexes
  ![Create index demo](media/create-index.gif)
* Add or update documents

## Quickstart

1. `git clone https://github.com/dereklegenzoff/vscode-azuresearch.git`
2. `code vscode-azuresearch`
3. `npm install`
4. `F5` to run the extension

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

Before we can accept your pull request you will need to sign a **Contribution License Agreement**. All you need to do is to submit a pull request, then the PR will get appropriately labelled (e.g. `cla-required`, `cla-norequired`, `cla-signed`, `cla-already-signed`). If you already signed the agreement we will continue with reviewing the PR, otherwise system will tell you how you can sign the CLA. Once you sign the CLA all future PR's will be labeled as `cla-signed`.

### Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### Telemetry

VS Code collects usage data and sends it to Microsoft to help improve our products and services. Read our [privacy statement](https://go.microsoft.com/fwlink/?LinkID=528096&clcid=0x409) to learn more. If you don't wish to send usage data to Microsoft, you can set the `telemetry.enableTelemetry` setting to `false`. Learn more in our [FAQ](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).

### License

[MIT](LICENSE.md)
