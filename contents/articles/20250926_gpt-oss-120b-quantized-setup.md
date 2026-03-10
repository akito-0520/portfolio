---
title: gpt-oss-120bをデスクトップPCで動かしてみた環境構築メモ
tags: [LLM, llama.cpp, 生成AI, やってみた, 初心者]
author: akito-0520
createdAt: "2025-09-26"
updatedAt: "2025-12-25"
description: gpt-oss-120bをデスクトップPCで動かしてみた環境構築メモ
---

# はじめに

**Windows 11 + llama.cpp（CUDA対応）** で gpt-oss-120b を動かした手順を、実際に使ったコマンドと要点解説をまとめました。

# 開発環境

- OS: Windows 11
- CPU: AMD Ryzen 9 9900X
- メモリ: 64GB
- GPU: NVIDIA RTX 5080（VRAM 16GB）
- フレームワーク: llama.cpp（GGML/GGUF系）

### 1. 事前準備（入れておくもの）

- Visual Studio 2022（C++開発ワークロード）
- CMake / Git
- NVIDIA ドライバ + CUDA Toolkit（GPUに合う版）
- Python（量子化/スクリプトが必要なら）

動作確認：

```:PowerShell
cl /?
cmake --version
git --version
nvcc --version
python --version
```

- 補足：`cl /?` が通らないとき

環境構築記事の中で `cl /?` を動作確認として紹介しましたが、場合によっては次のようなエラーが出ます。

```:PowerShell
cl : 用語 'cl' は、コマンドレット、関数、スクリプト ファイル、または操作可能なプログラムの名前として認識されません。
```

これは C++コンパイラ（cl.exe）がパスに通っていない ことが原因です。

- 解決方法

1. Visual Studio Installerで確認
   「C++によるデスクトップ開発」ワークロードをインストールしていないと `cl.exe` が入りません。入っていなければ追加インストールしてください

2. 開発者用コマンドプロンプトを使う
   スタートメニューから「`x64 Native Tools Command Prompt for VS 2022`」を起動して `cl /?` を実行すれば通ります。

このプロンプトは必要な環境変数が自動で設定されます。

### 2. llama.cpp をgitから取得

まずは適当にllama.cppをおいておくディレクトリを作成します。

```:PowerShell
cd C:\dev
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
```

### 3. 依存関係（vcpkgを使用）

まずは GitHub から vcpkg のリポジトリをクローンします。

```:PowerShell
git clone https://github.com/microsoft/vcpkg.git
```

すると、`vcpkg/` というフォルダが作られて、その中にソースコード一式が入ります。次にダウンロードしたフォルダに移動し、vcpkg 本体をビルドします。

```:PowerShell
cd vcpkg
.\bootstrap-vcpkg.bat
```

正しく終わるとカレントディレクトリに `vcpkg.exe` が生成されます。

### 4. CUDA対応でビルド

CUDAを対応させるように設定しながらllama.cppをビルドしていきます。

```:PowerShell
cd C:\llama.cpp
mkdir build

cmake -B build -DGGML_CUDA=ON -DGGML_CUDA_F16=ON -DCMAKE_TOOLCHAIN_FILE="C:/src/vcpkg/scripts/buildsystems/vcpkg.cmake"
cmake --build build --config Release
```

#### オプションの意味

- `-B build` : 生成物を build/ に分離（掃除しやすい）
- `-DGGML_CUDA=ON` : CUDAを有効化。GPU（RTX 5080）を使って推論を高速化
- `-DGGML_CUDA_F16=ON` : 半精度（FP16）で計算。VRAM節約＆速度向上が見込み
- `-DCMAKE_TOOLCHAIN_FILE=...vcpkg.cmake` : vcpkgのツールチェーン指定。依存ライブラリ解決を自動化

成功すると `build\bin\Release\` に `llama-cli.exe` などができます。

### 5. モデルの用意（GGUF & 量子化）

VRAMがRTX5080だと16GBなので量子化（例：q4_0） をしています。
今回はhugging Faceを用いてモデルをダウンロードしていく手順を書きます。

インストールするライブラリ

- Hugging Face Hubとやりとりするための公式 Python ライブラリの`huggingface_hub`
- - Hugging Face の大容量モデルを効率的にダウンロードするための拡張ライブラリの`hf_transfer`
- 今回のリポジトリはXetHub の高速ストレージに対応しているので高速にダウンロードするための`hf_xet`

これらをいれていきます。

```:PowerShell
python -m pip install -U huggingface_hub hf_transfer hf_xet
```

次に並列ダウンロードを有効化するために環境変数を一時的に設定してモデルをインストールしていきます。

```:PowerShell
set HF_HUB_ENABLE_HF_TRANSFER=1
```

ここでようやくモデルをダウンロードしていきます。
今回使用するファイルはhugging Face Hubで一般的に配布されているsafetensors形式のモデルを直接読み込むことはできないため、有志で配布してくれているGGUF形式のモデルをダウンロードしていきます。
※自分で変換する手順もありますが今回は割愛させていただきます。

```:PowerShell
 hf download <リポジトリ名>/<パス> <ファイルを指名するなら> --local-dir <配置するディレクトリ>
```

上記のように実行することで好きなモデルをダウンロードすることができます。
今回は[unslothチーム](https://huggingface.co/unsloth)が配布している4bit量子化されたGGUFモデルを使用します。分割ファイルとして分けられているので`--include`で対象フォルダを指定してダウンロードしていきます。

```:PowerShell
hf download unsloth/gpt-oss-120b-GGUF --include "Q4_K_M/*" --local-dir .\models\gpt-oss-120b-GGUF
```

### 6. 実行テスト

```:PowerShell
.\build\bin\Release\llama-cli.exe -m .\models\gpt-oss-120b-GGUF\Q4_K_M\gpt-oss-120b-Q4_K_M-00001-of-00002.gguf --n-gpu-layers 40 -p "chat-gpt-oss-120bについて詳しく教えて"
```

`-n-gpu-layers`はVRAMに合わせて上下させます。大きすぎると落ちます。

スレッド数やコンテキスト長（`--threads`, `--ctx-size`）も用途に応じて調整でOK。

### 7. 日本語プロンプトの扱い（文字化け回避）

Windows 環境では、そのままコマンドに `-p "日本語のテキスト"` を渡すと文字化けすることがあります。  
そのため、**UTF-8 で保存したテキストファイルを用意し、`-f` オプションで読み込む方法**が有効です。

#### プロンプトファイル例（prompt.txt, UTF-8で保存）

```:txt
<start_of_turn>user
日本で高い山を10個ランキング形式で教えてください<end_of_turn>
<start_of_turn>model
```

実行：

```:PowerShell
.\build\bin\Release\llama-cli.exe -m .\models\gpt-oss-120b-GGUF\Q4_K_M\gpt-oss-120b-Q4_K_M-00001-of-00002.gguf --n-gpu-layers 40 -f prompt.txt > output.txt
```

# まとめ

このメモどおりに進めれば、Windows 11 + RTX 5080(16GB) でも、量子化＋CUDA対応ビルドで gpt-oss-120b をローカル実行できます。ただ、生成速度はめちゃくちゃ遅いので実用的ではないです。快適に使いたいなら20bのモデルだとサクサク動くのでお勧めです。

- 参考: [Zenn記事「Windows 11でllama.cppをCUDA対応でビルドする」](https://zenn.dev/chitako/articles/0ad26c5807b18e)
