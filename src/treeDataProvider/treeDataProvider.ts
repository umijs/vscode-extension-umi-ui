import * as vscode from 'vscode';
import * as path from 'path';
import * as SockJS from 'sockjs-client';

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

    let sock = new SockJS('http://localhost:3000/umiui');

    vscode.commands.registerCommand('umi.openui', () => {
      const panel = vscode.window.createWebviewPanel('umi', 'Umi UI', vscode.ViewColumn.One, {
        retainContextWhenHidden: true,
        enableScripts: true,
      });

      panel.webview.onDidReceiveMessage(
        message => {
          if (message === 'initSocket') {
            panel.webview.postMessage('sockopen');
          } else {
            sock.send(message);
          }
        },
        undefined,
        context.subscriptions
      );

      sock.onopen = () => {
        panel.webview.postMessage('sockopen');
        vscode.window.showInformationMessage('sock open');
      };

      sock.onclose = () => {
        panel.webview.postMessage('sockclose');
        sock = null;
        vscode.window.showErrorMessage('sock close');
      };

      sock.onmessage = (e: any) => {
        // const message = JSON.parse(e.data);
        panel.webview.postMessage(e.data);
      };

      const getLocalFileUrl = (localPath: string) =>
        panel.webview.asWebviewUri(vscode.Uri.file(localPath));

      const cssPath = getLocalFileUrl(
        path.join(context.extensionPath, 'src', 'assets', 'dist', 'umi.ecab5baa.css')
      );
      const jsPath = getLocalFileUrl(
        path.join(context.extensionPath, 'src', 'assets', 'dist', 'umi.65bcf4a5.js')
      );
      panel.webview.html = this.getWebviewContent(cssPath, jsPath);
    });
  }

  getWebviewContent00(cssUrl: vscode.Uri, jsUrl: vscode.Uri) {
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
          window.isVscodeWebview = true;
        </script>
        <script src="http://b.alicdn.com/s/polyfill.min.js?features=default,es2015,es2016,es2017,fetch,IntersectionObserver,NodeList.prototype.forEach,NodeList.prototype.@@iterator,EventSource,MutationObserver,ResizeObserver,HTMLCanvasElement.prototype.toBlob"></script>
        <script src="http://gw.alipayobjects.com/os/lib/??react/16.8.6/umd/react.production.min.js,react-dom/16.8.6/umd/react-dom.production.min.js"></script>
        <script src="http://gw.alipayobjects.com/os/lib/moment/2.22.2/min/moment.min.js"></script>
        <script src="http://gw.alipayobjects.com/os/lib/antd/4.0.0-beta.0/dist/antd.min.js"></script>
        <script src="http://gw.alipayobjects.com/os/lib/sockjs-client/1.3.0/dist/sockjs.min.js"></script>
        <script src="http://gw.alipayobjects.com/os/lib/xterm/4.1.0/lib/xterm.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script src="${jsUrl}"></script>
        <iframe />
      </body>
    </html>`;
  }

  getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en" style="width: 100; height: 100%;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Umi UI</title>
      </head>
    
      <body style="width: 100%;height: 100%;padding: 0;margin: 0;">
        <iframe frameborder="0" src="http://localhost:3000/" height="100%" width="100%"></iframe>
      </body>
    </html>
    `;
  }
}
