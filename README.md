# Breathing Timer（呼吸タイマーアプリ）

呼吸法（吸う・止める・吐く）を設定・管理し、  
タイマー形式で実行できる Spring Boot 製の Web アプリケーションです。

職業訓練校で学習した内容（Spring Boot / MVC / DB連携）の
アウトプットとして作成しました。

---

## アプリ概要

- 呼吸設定（秒数）を登録・一覧表示
- 一覧からタイマー画面へ遷移
- Thymeleaf を使った画面表示
- PostgreSQL によるデータ永続化

---

## 使用技術

| 分類 | 技術 |
|----|----|
| 言語 | Java 25 |
| フレームワーク | Spring Boot |
| テンプレートエンジン | Thymeleaf |
| ORM | Spring Data JPA |
| DB | PostgreSQL |
| ビルドツール | Gradle |
| バージョン管理 | Git / GitHub |

---

## 画面構成

- 呼吸設定一覧画面  
- 呼吸設定登録画面  
- タイマー画面  

---

## 機能一覧

- 呼吸設定の登録
- 呼吸設定の一覧表示
- タイマー画面への遷移
- DB からのデータ取得・保存

---


## 起動方法（ローカル環境）

### 1. リポジトリをクローン

```bash
git clone https://github.com/yunyama1003/breathing-timer.git


2. DB を用意
PostgreSQL にデータベースを作成してください。

CREATE DATABASE breathing;

3. 設定ファイルを作成
以下のファイルを作成してください（※ GitHub には含めません）

src/main/resources/application-local.properties

中身を以下のように設定します。

spring.datasource.url=jdbc:postgresql://localhost:5432/breathing
spring.datasource.username=postgres
spring.datasource.password=your_password

4. アプリ起動
Eclipse から BreathingApplication を実行
または、プロジェクト直下で以下のコマンドを実行します。

./gradlew bootRun

作成者
名前：yamaguchi shun

学習内容：Java / Spring Boot / Webアプリ開発
