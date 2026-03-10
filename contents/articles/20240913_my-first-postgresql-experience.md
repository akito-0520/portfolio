---
title: PostgreSQLを使ってみた
tags: [PostgreSQL, SQL, AlmaLinux, Database]
author: akito-0520
createdAt: "2024-09-13"
updatedAt: "2024-09-13"
description: PostgreSQLを使ってみた
---

## はじめに

インターンで環境構築したサーバーを使ってデータベースと通信する機会がありました。その際にいろいろ行き詰ったりしたので同じような境遇の方に少しでも参考になるようにとしたことを書き綴っていこうと思います。
初めての経験だったので無駄なことやおかしなことを言っているかもしれませんがもしあった場合はコメント欄で優しく指摘していただけると幸いです。

### 実行環境

- OS: AlmaLinux 8.10
- PostgreSQL: 12.20

## 実際に使ってみる

まずはユーザーとデータベースを作成するところから
まずはコマンドの画面を開きユーザー資格をpostgresに変更するために

```
$ su - postgres
```

を実行して変更します。

さて今回は適当にユーザー名は`user1`、パスワードは`test_pass`、データベース名は`test`で作っていこうと思います

```
$ psql template1
```

を実行して

```
$ psql template1
psql (12.20)
"help"でヘルプを表示します。

template1=#
```

と表示されれば成功です。
ちなみに`psql`コマンドは簡単に言うと普段私たちが使っているようなパソコンの操作している画面のコマンドバージョンです。
次にこの画面上でつぎのプロンプトを打ち込みます。

```
create user1 with password 'test_pass'
create database test owner user1 encoding 'UTF-8'
```

これでユーザーとデータベースができましたね。
ちなみに抜け出すには

```
template1=# \q
```

を実行すればできます。
では次にデータベース上にテーブルを作っていこうと思います。
テーブル名は適当に`sample_table`とかで...

```
$ psql test

create table sample_table  (
    id serial primary key
    , name text
    , age integer
    , birthday timestamp with time zone
);
```

これらを打ち込むとデータベース上にテーブルが作成されます。
実際に確認してみましょう

```
$ psql test
```

と打ち込むと、

```
psql (12.20)
"help"でヘルプを表示します。

test=#
```

と表示されるので次に、

```
test=# \d sample_table
```

を実行すると

```
                                       テーブル"public.sample_table"
    列    |            型            | 照合順序 | Null 値を許容 |
フォルト
----------+--------------------------+----------+---------------+------------------------------------------
 id       | integer                  |          | not null      | nextval('sample_table_id_seq'::regclass)
 name     | text                     |          |               |
 age      | integer                  |          |               |
 birthday | timestamp with time zone |          |               |
インデックス:
    "sample_table_pkey" PRIMARY KEY, btree (id)
```

と表示されます。うまく作成できていることがわかりましたね。

では次に、実際にテーブル上にデータを入力していきたいと思います。
まずはいつも通りPostgreSQLに接続するために、

```
$ psql test
```

を実行します。
まずはデータが何もないことを確認するために、

```
test=# SELECT * FROM sample_table;
```

を実行します。すると、

```
test=# SELECT * FROM sample_table;
 id | name | age | birthday
----+------+-----+----------
(0 行)
```

と表示されました。まだなにもデータがないことが確認できましたね。
では実際にデータを入力していきたいと思います。

```
test=# INSERT INTO sample_table (id,name,age,birthday) VALUES (1,'user1',20,'2000-01-01 12:00:00');
```

このようなSQL文を実行すると、
`INSERT 0 1`と返ってくると思います。その場合は成功で、データベースに追加できています。
`SELECT * FROM sample_table;`を実行して確認してみましょう。

```
test=# SELECT * FROM sample_table;
 id | name  | age |        birthday
----+-------+-----+------------------------
  1 | user1 |  20 | 2000-01-01 12:00:00+09
(1 行)
```

実際に追加できていることがわかりましたね。

## 最後に

　やっていることは割と単純だと思うのですが実際にしているとセミコロンが抜けていたり、誤字があったりとつまらないミスをしてしまったりしました。
　普段私はGUIばかりつかっていたので今回CUIをつかうことでいい刺激になりました。さいごまで読んでいただきありがとうございます。
