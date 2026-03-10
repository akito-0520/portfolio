---
title: ubuntuでgoのAPIサーバーを立ててみた
tags: [Ubuntu, Go, API, サーバー構築]
author: akito-0520
createdAt: "2026-02-13"
updatedAt: "2026-02-13"
description: ubuntuでgoのAPIサーバーを立ててみた
---

# はじめに

私が以前から作りたかったWebアプリがあったのですが，インフラを構築する上で高専生に仮想サーバーを無償で貸し出すという企画[^1]に申し込ませていただいていたため，どうせなら使おうということでWebアプリのAPIサーバーを構築することになりました．

## 実行環境：みらいサーバー

高専生向けに無償提供されている「みらいサーバー（Powered by さくらのクラウド）」を使用しています。

| 項目                 | 内容                                 |
| :------------------- | :----------------------------------- |
| **プラットフォーム** | さくらのクラウド                     |
| **CPU**              | 仮想 2コア                           |
| **メモリ**           | 2GB                                  |
| **ストレージ**       | 100GB                                |
| **OS**               | Ubuntu 22.04.5 LTS (Jammy Jellyfish) |

# 構築

### 1. ライブラリ等のインストール

まずはubuntuに入っているインストール可能なソフトの一覧を最新にします．

```zsh
$ sudo apt update
```

必要なライブラリとプラグインをインストールしていきます．
Dockerの公式[^2]を参考に`apt`リポジトリを設定します．ubuntuの標準リポジトリにもdockerはありますが，そこに含まれているDockerはバージョンが古いことが多いためDockerのリポジトリをUbuntuに追加することで最新のバージョンを引っ張ってこれるようにしています．

```zsh
# Docker社公式のGCPキーを追加
$ sudo apt update
$ sudo apt install ca-certificates curl
$ sudo install -m 0755 -d /etc/apt/keyrings
$ sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
$ sudo chmod a+r /etc/apt/keyrings/docker.asc

# dockerのリストをaptに書き込む
$ sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# 最新のリポジトリを取得
$ sudo apt update
```

そしてドキュメントに従い以下のパッケージをインストールします．

- docker-ce: Docker本体
- docker-ce-cli: コマンド操作ツール
- containerd.io: コンテナ実行機能
- docker-buildx-plugin: ビルド機能の強化版
- docker build コマンドの実体
- docker-compose-plugin: Compose機能（V2）

```zsh
$ sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

最後にサーバー側で`docker`コマンドを実行する際，通常は `sudo`権限が必要ですが、GitHub Actions から実行する場合は`ubuntu`ユーザーが`sudo`なしで`Docker`を動かせるように設定する必要があります．
なので次のようなコマンドを実行し，ubuntuユーザーにdockerのコマンドを実行する権限を与えましょう．

```zsh
# ubuntu ユーザーを docker グループに追加
$ sudo usermod -aG docker ubuntu

# 設定を反映
$ newgrp docker
```

### 2. 公開鍵を用いたコードのclone

次にコードをgithubからcloneするために公開鍵を発行します．

```zsh
$ mkdir ~/.ssh
$ cd .ssh
$ ssh-keygen -t ed25519 -C "github_ssh"
```

何度か質問をされると思うの空白のままエンターキーを押してください．
すると生成が完了するので`ls`コマンドを使用して確認してみると

```zsh
$ ls
id_ed25519  id_ed25519.pub
```

などと出力されると思います．
そのうちの`.pub`の方の内容を`cat`コマンドでコピーしてください．
その後GitHubにログインし，右上のプロフィールアイコンをクリックして「Settings」を選択します．
左側のメニューから「SSH and GPG keys」を選び，「New SSH key」をクリックします．
タイトルを入力し，先ほどコピーした公開鍵をペーストして「Add SSH key」をクリックします．

うまく登録できたか確認してみましょう．
以下のコマンドを実行すると次のような内容が出力されると思います．

```zsh
$ ssh -T git@github.com

Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

これは初めて接続する際に確認されるものなのでそのまま`yes`を入力してください．

`Hi 〇〇! You've successfully authenticated, but GitHub does not provide shell access.`と出力されると正しく設定できているのでそのままssh接続でcloneします．

```zsh
$ cd ~
$ git clone git@github.com:<user>/<repo>.git
```

正しく実行できたらルートディレクトリにプロジェクトファイルがあると思います．

### 3. CD環境構築

毎回ssh接続してubuntuのアプリを最新にするのは面倒くさいですね．
なのでmainにpushしたら自動で本番環境にデプロイしてくれるCD環境を作成します．

今回はGithub Actionsを使います．
まずはGithub Actionsがubuntuサーバーへssh接続できるようにしていきます．

ubuntuのコンソールで先ほどと同じように鍵を作成します．
わかりやすいようにファイル名を変えてもいいですね．
変える際は`~/.ssh/config`を生成し，

```plaintext
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/<githubのcloneに使用した鍵のファイル名>
```

といった風に記述しておいてください．
そして同じ手順で生成した新しい鍵の**暗号鍵**の内容を`cat`コマンドなどを用いてコピーしてください．また，次のようなコマンドを実行し，IPアドレスも取得しておきます．

```zsh
$ curl ifconfig.me
```

そしてgithub上でプロジェクトの設定画面を開き，「Secrets and variables」→「Actions」→「New repository secret」とクリックしていき，先ほどコピーした鍵の内容を`SSH_PRIVATE_KEY`という名前で保存します．
また，先ほど取得したIPアドレスも`SERVER_IP`といった名前で保存しておきましょう．

次に，プロジェクトの中に`.github/workflows/deploy.yml`といったファイルとフォルダを作成します．
そしてymlファイルの中に次のような内容を記載します．

```yml
name: CD Pipeline

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - "backend/**"
      - "docker-compose.yml"
      - "!backend/README.md"

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # リポジトリ名を小文字に変換（Dockerのイメージ名は大文字に対応していないため）
      - name: Lowercase Repo Name
        run: echo "REPO_NAME=${GITHUB_REPOSITORY,,}" >> $GITHUB_ENV

      # 1. GHCRへログイン
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # 2. ビルド & プッシュ
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ env.REPO_NAME }}:latest

      # 3. SSHデプロイ
      - name: Deploy to Ubuntu
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # サーバー上のディレクトリへ移動
            cd ~/${{ github.event.repository.name }}

            # コードを最新化
            git pull origin main

            # GHCRへログイン (pull用)
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # コンテナ再起動
            docker compose pull
            docker compose up -d --remove-orphans
```

今回はDockerのイメージをGHCR（GitHub Container Registry）にプッシュし，そのイメージをUbuntuサーバーからプルしてきています．たまたま今回のリポジトリ名に大文字が含まれていたため無駄に変換する部分が含まれていますが全て小文字の方はわざわざしなくてもいいかもしれないです．

今回のプロジェクトではルート配下に`backend/`といったファイルを置き，その中で開発を行うため次のようなディレクトリ構成となっています．

```plaintext
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CDパイプライン設定
├── backend/
│   ├── Dockerfile              # Goビルド・実行用設定
│   ├── go.mod                  # Goモジュール管理
│   ├── main.go                 # バックエンド本体
│   └── README.md               # README
└── docker-compose.yml          # サーバー上のコンテナ構成管理
```

backendの中の`README.md`以外が変化した時や`docker-compose.yml`が変化したときにのみ発火したいため上記のようなpaths構造になっています．
また，`main`からブランチを切って作業している人は作業ブランチにコードをpushしても発火しないため，テストする際は`branches: [main, <branch name>]`といったように変更しておきましょう．（本当は最後のscriptのpullをしている部分も書き換えないといけないのですが面倒なので私はubuntuのコンソールから作業ブランチの内容を手動でpullしてきました．）
次に，テスト用に`Dockerfile`，`main.go`，`docker-compose.yml`を次のように変更します．

```Dockerfile
# Dockerfile
FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY . .

RUN CGO_ENABLED=0 go build -o server main.go

FROM alpine:latest

WORKDIR /root/
COPY --from=builder /app/server .

EXPOSE 8000
CMD ["./server"]
```

```go
// main.go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func main() {
	// ポート設定（デフォルト8000）
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// ハンドラ定義
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "Go Backend is running via GitHub Actions!",
		})
		fmt.Println("Request handled")
	})

	// 起動
	fmt.Printf("Server listening on port %s...\n", port)
	http.ListenAndServe(":"+port, nil)
}
```

image名とcontainer名は<name>をgithubのidにすれば，あとは小文字であればなんでもいいです．

```yml
# docker-compose.yml
version: "3.8"

services:
  backend:
    image: ghcr.io/<name>/<repo>:latest

    container_name: <repo-backend>

    ports:
      - "80:8000"

    restart: always
```

さて，これらをリモートにプッシュすると，actionsのタブのところで動いているところが見られると思います．
正しく動作すると緑のチェックマークがつきます．

次にCD環境を動かす上でいくつか起きたエラーを共有しようと思います．

:::note info
🚨 発生したエラー: Docker設定ファイルが見つからない

```plaintext
no configuration file provided: not found
no configuration file provided: not found
2025/12/31 17:44:23 Process exited with status 1
Error: Process completed with exit code 1.
```

- 原因: `docker compose`コマンドを実行したディレクトリに`docker-compose.yml`が存在していないことです

- 解決策: 私自身はubuntu上のプロジェクトが古いままだったため，先ほど述べた人力で作業ブランチの内容を`pull`したら解消しました
  あるのにこのエラーが起きる時は，GitHub Actionsの`cd`コマンドで指定したパスが、実際のサーバー上のディレクトリ名と一致していない可能性があるので確認してみてください．
  :::

:::note note

🚨 発生したエラー: Dockerデーモンへのアクセス権限エラー

```plaintext
permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
2025/12/31 17:49:07 Process exited with status 1
Error: Process completed with exit code 1.
```

- 原因: SSHで接続したユーザー（ubuntu）に、Dockerを操作する権限が付与されていないことにより発生します．通常、Dockerコマンドの実行には`sudo`が必要ですが，GitHub Actionsなどの自動化ツールでは`sudo`なしで実行できるグループ権限が必要になります

- 解決策: サーバー側（Ubuntu）にログインし，ユーザーを`docker`グループに追加して設定を反映させます

```zsh
# 1. ubuntu ユーザーを docker グループに追加
sudo usermod -aG docker ubuntu

# 2. 設定を現在のセッションに反映
newgrp docker
```

- 注意点: `newgrp`コマンドは実行したターミナル内でのみ有効です．GitHub Actions（外部からのSSH接続）に確実に反映させるには，サーバーを再起動するのが最も確実です
  :::

:::note note
🚨 発生したエラー：ポート重複（Address already in use）

```plaintext
failed to bind host port 0.0.0.0:80/tcp: address already in use
2025/12/31 18:43:51 Process exited with status 1
```

- 原因 サーバー側（ホスト）の80番ポートが，別のプロセス（Apache, Nginx, または別のDockerコンテナなど）によって既に使用されているため，新しいコンテナがポートを割り当てられなかった

- 解決策 80番ポートを使用しているプロセスを特定し，停止させます

```zsh
# 1. 80番ポートを使っている犯人を特定
sudo lsof -i :80

# 2. ApacheやNginxが動いている場合は停止・無効化（例: Apache）
sudo systemctl stop apache2
sudo systemctl disable apache2
```

:::

さて，緑のチェックマークがついたことにより，サーバーが起動しているはずなので`curl`を用いてアクセスしてみようと思います．先ほど確認したIPアドレスを打ち込んでください．

```zsh
# 〇〇の部分に確認したサーバーのIPアドレス（例: 123.456.78.90）を入れて実行
$ curl http://〇〇
```

成功すれば次のように表示されます．

```json
{ "message": "Go Backend is running via GitHub Actions!", "status": "success" }
```

# まとめ

今回はubuntu上に一からAPIサーバーを構築しました．
まだ実際に運用する上では通信がまだ暗号化されておらず，SSL化をすることが必要なので別の記事で行なっていこうと思います．

[^1]: [みらいサーバー｜高専キャリア](https://kosen-career.tech/service/mirai-server)

[^2]: [Install Docker Engine on Ubuntu | Docker Docs](https://docs.docker.com/engine/install/ubuntu/#firewall-limitations)
