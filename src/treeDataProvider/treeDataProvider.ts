import * as vscode from 'vscode';
import * as path from 'path';

export class UmiTaskProvider implements vscode.TreeDataProvider<UmiTask> {
  constructor(private workspaceRoot: string | undefined) {}

  onDidChangeTreeData?: vscode.Event<UmiTask | null | undefined> | undefined;

  getTreeItem(element: UmiTask): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: UmiTask | undefined): vscode.ProviderResult<UmiTask[]> {
    const umiuiAssetsPath = `${this.workspaceRoot}/node_modules/umi-ui/client/dist`;
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('工作空间为空');
      return Promise.resolve([]);
    }
    return Promise.resolve([
      {
        label: '打开Umi UI',
        command: {
          command: 'umi.openui',
          title: '打开Umi UI',
        },
      },
    ]);
  }
}

export class UmiTask extends vscode.TreeItem {
  constructor(public readonly label: string) {
    super(label);
  }
}

export class UmiTaskView {
  private umiTaskView: vscode.TreeView<UmiTask>;

  constructor(context: vscode.ExtensionContext) {
    const umiTaskProvider = new UmiTaskProvider(vscode.workspace.rootPath);
    this.umiTaskView = vscode.window.createTreeView('umitask', {
      treeDataProvider: umiTaskProvider,
    });

    vscode.commands.registerCommand('umi.openui', () => {
      const panel = vscode.window.createWebviewPanel('umi', 'Umi UI', vscode.ViewColumn.One, {
        retainContextWhenHidden: true,
        enableScripts: true,
      });
      const getLocalFileUrl = (localPath: string) =>
        panel.webview.asWebviewUri(vscode.Uri.file(localPath));

      const cssPath = getLocalFileUrl(
        path.join(context.extensionPath, 'src', 'assets', 'dist', 'umi.dd52a6f4.css')
      );
      const jsPath = getLocalFileUrl(
        path.join(context.extensionPath, 'src', 'assets', 'dist', 'umi.c855d08e.js')
      );
      panel.webview.html = this.getWebviewContent(cssPath, jsPath);
    });
  }

  getWebviewContent(cssUrl: vscode.Uri, jsUrl: vscode.Uri) {
    return `<!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="http://gw.alipayobjects.com/os/lib/xterm/4.1.0/css/xterm.css" />
        <link rel="stylesheet" href="${cssUrl}" />
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no"
        />
        <title>Umi UI</title>
        <script>
          window.routerBase = '/';
        </script>
        <script src="http://b.alicdn.com/s/polyfill.min.js?features=default,es2015,es2016,es2017,fetch,IntersectionObserver,NodeList.prototype.forEach,NodeList.prototype.@@iterator,EventSource,MutationObserver,ResizeObserver,HTMLCanvasElement.prototype.toBlob"></script>
        <script src="http://gw.alipayobjects.com/os/lib/??react/16.8.6/umd/react.production.min.js,react-dom/16.8.6/umd/react-dom.production.min.js"></script>
        <script src="http://gw.alipayobjects.com/os/lib/moment/2.22.2/min/moment.min.js"></script>
        <script src="http://gw.alipayobjects.com/os/lib/antd/4.0.0-beta.0/dist/antd.min.js"></script>
        <script src="http://gw.alipayobjects.com/os/lib/sockjs-client/1.3.0/dist/sockjs.min.js"></script>
        <script src="http://gw.alipayobjects.com/os/lib/xterm/4.1.0/lib/xterm.js"></script>
      </head>
      <body>
        <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
        <div id="root"></div>
        <script src="${jsUrl}"></script>
      </body>
    </html>`;
  }
}
