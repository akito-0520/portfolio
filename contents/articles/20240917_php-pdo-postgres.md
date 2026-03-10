---
title: PostgreSQLにPHPで通信してみた
tags: [PHP, PostgreSQL, SQL, AlmaLinux]
author: akito-0520
createdAt: "2024-09-17"
updatedAt: "2024-09-17"
description: PostgreSQLにPHPで通信してみた
---

## はじめに

インターンで環境構築したサーバーを使ってデータベースと通信する機会がありました。PostgreSQLを用いてデータベースを作成する作業は以前[記事](https://qiita.com/akito-0520/items/041ec30f01128ad0b3e3 "PostgreSQLを使ってみた")にまとめたので、この記事ではその先の実際に通信する作業をまとめたいとおもいます。
初めての経験だったので無駄なことやおかしなことを言っているかもしれませんがもしあった場合はコメント欄で優しく指摘していただけると幸いです。

### 実行環境

- OS: AlmaLinux 8.10
- PostgreSQL: 12.20
- PHP 8.0.30

## 実際に使ってみる

前回でPostgreSQPにデータベースを作成することはできたので今回はPHPに入りたいと思います
まずはrootディレクトリから`/var/www/html/`ディレクトリにPHPファイルを作成します。`cd`コマンドを使用して`html`ディレクトリに移動して、今回は`test.php`という名前で作成しようと思います。

```
$ touch test.php
```

このコマンドを実行することで新しいファイルを作成することができます。

次に、

```
$ ip addr
```

から分かるIPアドレスの末尾に/test.phpをつけてブラウザに打ち込むと先ほど作成したphpファイルをブラウザ上から閲覧することができるようになりました。

では実際に先ほどのファイルにphpを書いていこうと思います。
エディターは個人の好みによると思うのでお好きなエディターで書いてください

```php:test.php
<?php
$dsn = 'pgsql:dbname=test host=localhost port=5432';

try {
        $dbh = new PDO($dsn, 'user1', 'test_pass');
        print('接続に成功しました。<br>');
} catch (Exception $e)  {
        print('Error:'.$e->getMessage());
        die();
}
?>
```

ここではデータベース名を`test`、接続先のホスト名を`localhost`、ユーザー名を`user1`、user1のパスワードを`test_pass`、ポート番号はPostgreSQLのデフォルトが5432なので`5432`としています。

では実際に`IPアドレス/test.php`にアクセスすると成功した場合、画面上に`接続に成功しました。`と表示されるはずです。失敗している場合はtry文でエラーハンドリングしているのでエラー文が表示されるはずです。

では次にPHPからPostgreSQLにデータを追加していきたいと思います。
先ほどのプログラムに少し変更を加えます。なお、PHPではクエリを実行するにはPDOクラスのqueryメソッドを使用します。
`$sql`をSQL文とすると、先ほど作った`$dbh`インスタンスも用いて、

```php
$dbh->query($sql);
```

と書くことで実行することができます。

```diff_php:test.php
<?php
$dsn = 'pgsql:dbname=test host=localhost port=5432';

try {
        $dbh = new PDO($dsn, 'user1', 'test_pass');
        print('接続に成功しました。<br>');
+       $sql = "";
+       $dbh->query($sql);

} catch (Exception $e)  {
        print('Error:'.$e->getMessage());
        die();
}
?>
```

ではWebページをリロードしてphpファイルを再読み込みしてみるとエラーが出力されました。
![スクリーンショット 2024-09-17 091757.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3771942/e2c26d9b-e227-0e86-f7a1-1133465945eb.png)
これはSQL文を実行しているユーザーに実行権限がないことを表しています。
なのでCUIから実行権限をユーザーに付与してみましょう。

```
$ su - postgres
```

をコマンドプロンプトで実行してpostgresユーザーとしてログインします。次に、

```
$ psql test
```

を実行してtestテーブルのCUIを起動します。
そして次のようなSQL文を実行すると以前作ったユーザーにすべての権限が付与されます。

```
GRANT SELECT, INSERT, UPDATE, DELETE ON テーブル名 TO ユーザー名;
```

権限が付与されたので再びWebに戻り、リロードしてみるとエラーは出力されなくなっていると思います。

では次にフォームに入力した内容をDBに登録できるようにしましょう。

```diff_php:test.php
<?php
$dsn = 'pgsql:dbname=test host=localhost port=5432';

try {
        $dbh = new PDO($dsn, 'user1', 'test_pass');
        print('接続に成功しました。<br>');
-       $sql = "";
+       if($_POST['id'] && $_POST['name'] && $_POST['age'] && $_POST['birthday']) {
+              $sql = "INSERT INTO sample_table (id,name,age,birthday) VALUES ({$_POST['id']},'{$_POST['name']}',{$_POST['age']},'{$_POST['birthday']}')";
+              $dbh->query($sql);
+       }
} catch (Exception $e)  {
        print('Error:'.$e->getMessage());
        die();
}
?>

+ <!DOCTYPE html>
+ <meta charset = "utf-8">
+
+ <head></head>
+
+ <body>
+ <form action="test.php" method="post">
+        <label for="id">id:</label>
+        <input name="id" id="id" type="number">
+
+        <label for="name">名前:</label>
+        <input name="name" id="name" type="text">
+
+        <label for="age">年齢:</label>
+        <input name="age" id="age" type="number">
+
+        <label for="birthday">誕生日:</label>
+        <input name="birthday" id="birthday" type="date">
+    <button type="submit">Submit</button>
+ </form>
+
+ </body>
+ </html>
```

このように変更してページを再読み込みするとフォームができたと思います。
それぞれのボックスにデータを入力して、送信ボタンを押してみましょう。
例えば、`id: 1`、`name: user1`、`age: 20`、`birthday: 2000-01-01`と入力して送信してみます。
エラーが出力されなかった場合は成功です。
CUIから確認してみましょう。

```
$ psql test

test=# SELECT * FROM sample_table;
```

と打ち込むと、

```
test=# SELECT * FROM sample_table;
 id | name  | age |        birthday
----+-------+-----+------------------------
  1 | user1 |  20 | 2000-01-01 00:00:00+09
(1 行)
```

と表示されましたね。追加成功です🎉

今の状態ではSQLインジェクションなどセキュリティ対策は全くしていないので、実際にインターネット上に公開する際はしっかり対策するようにしましょう。
