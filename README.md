# ひと呼吸 — Breathing Timer

「吸う・止める・吐く」秒数と回数を設定して使う、シンプルな呼吸タイマーです。スマートフォンやPCのブラウザで使えるPWA版と、ローカルで動かすSpring Boot版があります。両者の設定データは共有されません。

## PWA版を使う

[公開アプリ（GitHub Pages）](https://yunyama1003.github.io/breathing-timer/)を開きます。PCでもスマートフォンでも利用でき、アプリ本体の利用にJavaやDBは不要です。iPhoneではSafariの共有メニューから「ホーム画面に追加」、Androidではブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選べます。

1. 「呼吸のリズム」で秒数・回数を入力するか、「リラックス 5分」の「この設定を使う」を押します。
2. 設定を確認して「スタート」を押します。一時停止・リセット、音のオン／オフも利用できます。画面を離れるとタイマーは一時停止し、画面ロック中の進行や通知は保証しません。
3. 必要なら「この設定を保存」を押します。「保存した設定」から呼び出せます。

設定可能な範囲は次のとおりです。

| 項目 | 範囲 |
| --- | --- |
| 吸う | 1〜30秒 |
| 止める | 0〜30秒 |
| 吐く | 1〜30秒 |
| 回数 | 1〜60回 |

おすすめの「リラックス 5分」は、吸う4秒・止める0秒・吐く6秒を30回繰り返す設定です（合計300秒）。「この設定を使う」はフォームと現在の設定表示を更新しますが、タイマーの開始や設定の保存は自動では行いません。各項目はその後も自由に変更できます。

保存した設定はブラウザの `localStorage` に保持されます。「スマホで使う・バックアップ」からJSON形式でバックアップを保存・読み込みできます。設定は端末・ブラウザごとに独立しており、PWAからサーバーへ送信されません。

PWAはService Workerでアプリのファイルをキャッシュします。画面内に「オフライン利用の準備ができました」と表示された後は、キャッシュとブラウザの保存データが残っている間、通信なしでも利用できます。更新が見えない場合はオンラインでページを再読み込みしてください。

## Spring Boot版をローカルで使う

Java 25、Spring Boot 4.0.1、Thymeleaf、H2、Flywayを使用します。呼吸設定を登録して一覧からタイマーを開けます。登録するのはタイマー開始前の**設定**であり、実施したセッションの履歴ではありません。PWA版の `localStorage` とは別に、プロジェクト直下の `data/breathing` を基にしたH2ファイルへ保存します。Flywayが初回起動時にスキーマを作成し、V2で回数上限を60回へ拡張します。PostgreSQLの準備は不要です。

JDK 25を用意して、リポジトリのルートで実行します。

```bash
git clone https://github.com/yunyama1003/breathing-timer.git
cd breathing-timer
./gradlew bootRun
```

Windows PowerShellでは `./gradlew bootRun` の代わりに `.\gradlew.bat bootRun` を使います。起動後は <http://localhost:8080/breathing/list> を開いてください。H2の `data/` はGit管理対象外です。Spring Boot版は開発用のローカル構成で、認証やCSRF保護を有効にした公開運用向けの設定ではありません。

## 開発・テスト

Javaテストは `./gradlew test`（Windows: `.\gradlew.bat test`）で実行します。テスト用H2はメモリ上に作られ、通常の `data/` を変更しません。

Node.jsを用意すると、PWA・タイマーのJavaScriptテストと公開用ファイルの生成を実行できます。

```bash
node --test src/test/js/*.test.js
node scripts/build-pwa.cjs
```

生成された `build/pwa` をローカルHTTPサーバーで配信するとPWAを確認できます。Service WorkerはHTTPSまたはlocalhostで動作します。公開時は `.github/workflows/pages.yml` が対象ファイルの `main` への変更を検知し、テスト・ビルド後にGitHub Pagesへ配置します。キャッシュ対象を変更するときは `site/sw.js` の `CACHE` バージョンも更新します。

## 作者

[yunyama1003](https://github.com/yunyama1003)
