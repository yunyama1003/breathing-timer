# Breathing Timer

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

* PostgreSQL
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
* PostgreSQL
* Node.js（JavaScriptテストを実行する場合）

### 3. データベースと設定ファイルを準備

PostgreSQLに開発用のデータベースとユーザーを作成し、そのユーザーにデータベースの権限を与えます。実際の名前やパスワードに置き換えてください。

```sql
CREATE USER breathing_user WITH PASSWORD 'change_me';
CREATE DATABASE breathing OWNER breathing_user;
```

```bash
cp src/main/resources/application.properties.example \
   src/main/resources/application-local.properties
```

Windows PowerShellの場合:

```powershell
Copy-Item src/main/resources/application.properties.example src/main/resources/application-local.properties
```

`application-local.properties` の接続先を次のように設定します。

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/breathing
spring.datasource.username=breathing_user
spring.datasource.password=change_me
```

初回起動時にFlywayが `breathing_records` テーブルを作成します。既存DBへ導入する場合は、先にバックアップとスキーマ確認を行い、[改善実装・検証手順書](docs/improvement-procedure.md) の既存DB手順に従ってください。

### 4. アプリ起動

```bash
./gradlew bootRun
```

Windows PowerShellの場合:

```powershell
.\gradlew.bat bootRun
```

### 5. ブラウザでアクセス

```
http://localhost:8080/breathing/list
```

---

## 🔐 設定ファイルについて

* `application.properties.example`

  * Git管理対象（サンプル）
* `application-local.properties`

  * **Git管理外**（ローカル環境用）

> 実DBの接続情報はGitHubに含めない運用をしています。

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

空の検証用PostgreSQLを使うマイグレーション・永続化の受入確認は、[改善実装・検証手順書](docs/improvement-procedure.md) のAT-13を参照してください。個人用DBをテスト接続先に使用しないでください。

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
