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

👉 [デモ動画を再生する（demo.mp4）](docs/demo.mp4)
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

### 2. 設定ファイルを準備

```bash
cp src/main/resources/application.properties.example \
   src/main/resources/application-local.properties
```

※ `application-local.properties` にDB接続情報を設定してください。

### 3. アプリ起動

```bash
./gradlew bootRun
```

### 4. ブラウザでアクセス

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
