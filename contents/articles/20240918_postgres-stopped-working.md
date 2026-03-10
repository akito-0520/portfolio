---
title: PostgreSQLが動かなくなった
tags: [PostgreSQL]
author: akito-0520
createdAt: "2024-09-18"
updatedAt: "2024-09-18"
description: PostgreSQLが動かなくなった
---

# 経緯

色々作業したあとにローカルサーバーにおいてあるPHPファイルを開こうとすると、

```txt
Error:SQLSTATE[08006] [7] could not connect to server: Connection refused Is the server running on host "localhost" (::1) and accepting TCP/IP connections on port 5432? could not connect to server: Connection refused Is the server running on host "localhost" (127.0.0.1) and accepting TCP/IP connections on port 5432? could not connect to server: Connection refused Is the server running on host "localhost" (127.0.0.1) and accepting TCP/IP connections on port 5432?
```

なんじゃこのエラー...
軽く見た感じサーバーが止まってるっぽい？再びPostgreSQLを起動しようとすると、

```sh
Job for postgresql.service failed because the control process exited with error code.
See "systemctl status postgresql.service" and "journalctl -xe" for details.
```

と言われたのでおとなしく`journalctl -xe`を実行すると、Hintのところに

```sh
HINT:  Is another postmaster already running on port 5432? If not, wait a few seconds and retry.
```

ポートがかぶってる？...
いろいろしてもなかなか治らず途方に暮れてました。

# したこと

まずはポート`5432`が使用中かを確かめる。

```sh
$ ps aux | grep 5432

root        1424  0.0  0.0  10388  1072 pts/3    S+   16:43   0:00 grep --color=auto 5432
```

うーん...別に使ってなさそう？
再起動もしたりしたけど相変わらず原因はわからず。
`systemctl restart postgresql`も実行してみたけど同じ結果、`stop`からの`start`でも変わらず。
ネットで調べていると前回のプロセスが残っているとか書いてあったけどなかったしなぁ...

# 原因

さっきの出力でもう一つ見落としていた、`HINT:  Future log output will appear in directory "log".`
エラーログをみてみることに。
`postgres`でコマンドにログインして、`ls data/log`を実行してみるとエラーログがあった。
これを開いてみると一番下のところに、

```txt
2024-09-18 16:32:03.411 JST [1413] LOG:  invalid connection type "IPv6"
2024-09-18 16:32:03.411 JST [1413] CONTEXT:  line 93 of configuration file "/var/lib/pgsql/data/pg_hba.conf"
2024-09-18 16:32:03.411 JST [1413] FATAL:  could not load pg_hba.conf
2024-09-18 16:32:03.412 JST [1413] LOG:  database system is shut down
```

これは`pg_hba.conf`ファイルをうまく読み込めていない？...
実際に`pg_hba.conf`ファイルを開いてみると、

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust
#local   all             all                                     scram-sha-256
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
#host    all             all             127.0.0.1/32            scram-sha-256
 IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
#local   replication     all                                     trust
#host    replication     all             127.0.0.1/32            trust
#host    replication     all             ::1/128                 trust
```

あ...9行目のIPv6 ~のところのコメントアウトはずれてる。
コメントアウトして再び読み込んでみると、うまくできた!!!

いつのまにか間違えてコメントアウトを外していたみたいです。
ずっとコマンド上のエラーばかり見ていたから気づかなかった...

みなさんもしっかりとエラーログを見るようにしましょう笑
