import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";
import * as fse from "fs-extra";
import { DocumentTreeItem } from "./DocumentTreeItem";
import { ext } from "./extensionVariables";
import { debug, debuglog } from "util";

export class DocumentEditor implements vscode.Disposable {
    private files: string[] = [];

    public async dispose(): Promise<void> {
        for (const f of this.files) {
            try {
                await fse.remove(f);
            }
            catch {
                ext.outputChannel.appendLine(`Failed to delete temporary file '${f}')`);
            }
        }
    }

    public async showEditor(docItem: DocumentTreeItem): Promise<void> {
        const suffix = DocumentEditor.getRandomSuffix();
        const filename = `${docItem.searchServiceName}-${docItem.index.name}-${suffix}.json`;
        const localPath = path.join(os.tmpdir(), "vscode-azuresearch-editor", filename);
        await fse.ensureFile(localPath);
        this.files.push(localPath);

        const content: any = await docItem.readContent();
        await fse.writeJson(localPath, content, { spaces: 4 });

        const doc = await vscode.workspace.openTextDocument(localPath);
        await vscode.window.showTextDocument(doc);
    }

    private static getRandomSuffix(): string {
        const buffer: Buffer = crypto.randomBytes(5);
        return buffer.toString('hex');
    }
}
