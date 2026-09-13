# Breathing Timer

## スマホ版（PCの起動不要）

スマホ用のPWAを `site/` に追加しました。設定はスマホ内に保存し、Java・H2・ログインを必要としません。PC版も引き続き利用できます。

公開先: https://yunyama1003.github.io/breathing-timer/

- iPhone: Safariで公開URLを開き、共有メニューから「ホーム画面に追加」。
- Android: ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」。
- 「スマホで使う・バックアップ」を開き、「オフライン利用の準備ができました」と表示された後は、キャッシュが残っている間オフラインで利用できます。
- 画面を離れると一時停止します。ロック中のカウント・通知は保証しません。
- 設定は端末・ブラウザごとに保存されます。バックアップの保存・読み込みを用意しています。PC版H2の設定は必要に応じて再登録してください。
- アプリ自体は公開されますが、設定をサーバーへ送信しません。

### PWAの開発・公開

```bash
node --test src/test/js/*.test.js
node scripts/build-pwa.cjs
```

生成した `build/pwa` をローカルHTTPサーバーで配信します。Service WorkerはHTTPSまたはlocalhostで動作します。GitHubのSettings → Pages → Sourceを **GitHub Actions** に設定すると、mainへの対象ファイルの変更で `.github/workflows/pages.yml` が自動公開します。公開物は `build/pwa` のみです。

Service Workerのキャッシュを更新するときは、`site/sw.js` の `CACHE` バージョンを増やしてください。新バージョンはアプリの全タブを閉じて開き直すと適用されます。実機でオフラインを検証する場合は、準備完了後に機内モードへ切り替えてアプリを開き直してください。

以下はPC版の説明です。

シンプルな **呼吸トレーニング用タイマーアプリ** です。

吸う・止める・吐くのリズムを **視覚・音・カウント** でサポートし、
リラックスや集中力向上を目的としています。

---

## 🫁 主な機能

* 呼吸フェーズ切り替え（吸う / 止める / 吐く）
* カウントダウンタイマー表示
* フェーズ切り替え時の効果音
* スタート / ストップ / リセット操作
* シンプルで見やすいUI

---
## 🎥 動作デモ

以下の動画は、ローカル環境で実行した際のデモです。

- タイマー開始
- 呼吸フェーズの切り替え
- カウントダウン表示
- 効果音の再生

---
## 🛠 使用技術

### フロントエンド

* HTML / CSS
* JavaScript（タイマー制御）

### バックエンド

* Java
* Spring Boot
* Thymeleaf

### データベース

* H2（アプリ内蔵・ファイル保存）
* Flyway（スキーマ管理）

---

## 📂 ディレクトリ構成（一部）

```
breathing-timer
├─ src
│  ├─ main
│  │  ├─ java
│  │  │  └─ com.example.breathing
│  │  └─ resources
│  │     ├─ templates
│  │     │  └─ breathing
│  │     │     └─ timer.html
│  │     ├─ static
│  │     │  └─ sound
│  │     │     └─ change.mp3
│  │     └─ application.properties.example
```

---

## 🚀 起動方法

### 1. リポジトリをクローン

```bash
git clone https://github.com/yunyama1003/breathing-timer.git
cd breathing-timer
```

### 2. 前提ソフトウェア

* JDK 25
* Node.js（JavaScriptテストを実行する場合）

データベースのインストールや接続設定は不要です。初回起動時にH2とFlywayが `data` フォルダと必要なテーブルを自動作成します。

### 3. アプリ起動

```bash
./gradlew bootRun
```

Windows PowerShellの場合:

```powershell
.\gradlew.bat bootRun
```

### 4. ブラウザでアクセス

```
http://localhost:8080/breathing/list
```

---

## 💾 データの保存場所

登録した設定はプロジェクト直下の `data` フォルダに保存されます。このフォルダはGit管理対象外です。データを初期化したい場合は、アプリを停止してから `data` フォルダを削除してください。

---

## ✅ テスト

Javaの入力検証テスト:

```bash
./gradlew test
```

Windows PowerShellでは `.\gradlew.bat test` を使用します。

タイマーのJavaScriptテスト:

```bash
node --test src/test/js/breathing-timer.test.js
```

Javaテストではメモリ上のH2を使用するため、通常の `data` フォルダは変更されません。

---

## 🎯 開発目的

* Java / Spring Boot の理解深化
* フロントエンドとバックエンドの連携学習
* 実用的で小さなアプリを完成させる経験

---

## 📌 今後の拡張予定

* 呼吸パターンのカスタマイズ
* スマホ対応（レスポンシブ対応）
* ログイン機能
* 呼吸履歴の保存

---

## 👤 作者

* GitHub: [yunyama1003](https://github.com/yunyama1003)

---

## 📄 ライセンス

MIT License
