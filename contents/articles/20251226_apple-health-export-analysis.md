---
title: HealthKitのXMLをいじってみた
tags: [XML, Apple, 初心者, 初心者向け, HealthKit]
author: akito-0520
createdAt: "2025-12-26"
updatedAt: "2025-12-26"
description: HealthKitのXMLをいじってみた
---

# はじめに

地方版未踏プロジェクトのAKATSUKIに私の案が採択されたのですが，そのプロダクトの開発の中でAppleのヘルスケアのデータを使いたいと思い，色々調べていたのでその過程をまとめてみようと思います．

# 開発環境

- MacOS Tahoe 26.2
- AntiGravity 1.13.3

# 本文

### 1. HealthKitとは？

`HealthKit`とはAppleが提供するフレームワークで，iPhoneやApple Watchなどのデバイスで収集される健康・フィットネスデータを一元的に管理・共有するための仕組みのことを指します．
実際にどこでデータを見るかというと，iPhoneなどにデフォルトで入っているヘルスケアAppから右上のアイコンをタップすると下の方にエクスポートすることで見ることができます．

![HealthProfile.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3771942/c8e798ac-d06f-41f0-948e-c2db14f05ae0.png)

では実際に書き出して中身を見てみましょう．
書き出しが完了すると保存先が選べるので適当に選ぶと良いです．
保存された.zipを展開すると4つの項目のファイルとフォルダがありますね．そのうちの`export.xml`がメインのデータです．

### 2. xmlってなに？...

みなさんは知っているかもしれないですが，私はxmlを名前しか知らずどのようなものかわかりませんでした．そこで調べてみるとGoogleのAIさんはこのように答えてくれました．

:::note info
XML（Extensible Markup Language）とは、データの内容と構造を記述するための「拡張可能なマークアップ言語」です。HTMLのようにタグ（<〇〇>）を使ってデータを意味付け（例：`
<name>田中</name>`）し、人間にもコンピュータにも読みやすい形式で、システム間でデータを共有・交換するのに役立ちます。独自のタグを自由に定義できる高い拡張性と、データに意味を持たせて構造化できる点が特徴で、設定ファイルやデータ連携などで広く使われています
:::

らしいです．HTMLのようなマークアップ言語と似ているのですが，HTMLは既存の\<p>や\<h1>といったタグを用いてコーディングしていくのに対して，XMLは新しいタグを作れるところが違ったりするようですね．
また，HTMLはWeb上に情報を表示するためなのですが，XMLはシステムに情報を渡すのがメインみたいです．
なるほどといった感じで，ではどのようにして記述していくのかをみていこうと思います．

### 3. xmlの文法(蛇足)

ネット上の記事[^1]を参考にしながら見ていくと，基本的な文法はHTMLと一緒っぽいですね．
例えばユーザーの名前と年齢を表示したいときは，

```xml
<User>
    <name>Akito</name>
    <age>20</age>
</User>
```

といった感じで表現できます．これは**json**で表現すると，

```json
{
  "User": {
    "name": "Akito",
    "age": 20
  }
}
```

といったようになります．
見慣れるとxmlの方がタグで囲まれている分見やすい気もしますね．
また，xmlには**属性**という要素があり，先ほどの内容を次のようにも書けます．

```xml
<User name="akito" age="20" />
```

これはかなり便利ですね．普通だと数行必要な内容も1行で書けますし，タグ名をみるとどのような要素かがすぐわかります．

### 4. HealthKitのxmlは？

ここからが本題なのですが実際にエクスポートしたデータはどのような構造になっているのでしょうか？

まずはじめに`<! ... >`と記述されているのが **DTD**（Document Type Definition：文書型定義）と呼ばれる，XMLファイル内で「どのようなタグを使い，どのような構造にするか」というルールを定義しているものです．
コンピュータにデータの定義を教えてあげているのですね，優しい．`<!ATTLIST ...>`とかがそうですね．

次に`<HealthData ...>`タグで囲まれているのがメインの生体データです．
`<Record ...>`というふうに記載されているのが一つのデータで`type`にデータの種類が記載されています．
今回私は**心拍数**, **安静時心拍数**, **カテゴリ分けされた睡眠データ**の3つを使用したかったためそれらを探していきます．
HealthKitの公式リファレンス[^2]を参照した後に，なぜか言語を`Objective-C`にしないと調べたいtype型が出てこないので変更し，`HealthKit/Data types/HKObjectType/HKQuantityTypeIdentifier/`を探すと，Vital signsセクションに

- HKQuantityTypeIdentifierHeartRate
- HKQuantityTypeIdentifierRestingHeartRate

`HealthKit/Data types/HKObjectType/HKCategoryIdentifier/`を探すと，Mindfulness and Sleepセクションに

- HKCategoryTypeIdentifierSleepAnalysis

があると思います．これらが先ほど私が欲しがっていたデータです．
他にも欲しいデータがあるときは**Data types**セクションを探すとあると思います．

具体的に心拍データの例を見てみましょう．

```xml
<Record
  type="HKQuantityTypeIdentifierHeartRate"
  value="109"
  unit="count/min"
  startDate="2025-09-19 16:30:34 +0900"
  endDate="2025-09-19 16:30:34 +0900"
  creationDate="2025-09-19 16:30:37 +0900"
  sourceName="Apple Watchです。"
  sourceVersion="26.0"
  device="&lt;&lt;HKDevice: 0x79a9...&gt;"
/>
```

このようなタグのそれぞれの属性の意味は次のようなものです．

| 属性名            | データ識別（日本語名）       | 具体的な値（例）                    | 備考                             |
| :---------------- | :--------------------------- | :---------------------------------- | :------------------------------- |
| **type**          | **データ種別識別子**         | `HKQuantityTypeIdentifierHeartRate` | データの種類（心拍数など）を示す |
| **value**         | **測定値**                   | `109`                               | 実際の計測データの値             |
| **unit**          | **単位**                     | `count/min`                         | 値の単位（心拍数の場合は回/分）  |
| **startDate**     | **測定開始日時**             | `2025-09-19 16:30:34 +0900`         | 計測が始まった時間               |
| **endDate**       | **測定終了日時**             | `2025-09-19 16:30:34 +0900`         | 計測が終わった時間               |
| **creationDate**  | **データ作成日時**           | `2025-09-19 16:30:37 +0900`         | データベースに保存された時間     |
| **sourceName**    | **情報元（アプリ・機器名）** | `Apple Watchです。`                 | データを記録した元となる名称     |
| **sourceVersion** | **ソースのバージョン**       | `26.0`                              | 記録時のOSやアプリのバージョン   |
| **device**        | **測定デバイスの詳細**       | `&lt;&lt;HKDevice: 0x79a9...&gt;`   | 機器のモデル名やハードウェアID   |

これらを用いることでスマートウォッチなどから収集したデータを解析することができます，
実際に解析する際には例えばPythonの`xml.etree.ElementTree`などを用いることでできます．
私自身はwebでファイルをアップロードしてバックエンドで解析を行いたかったのでアップロードした後に正規表現でフィルターにかけて文字データとして送って解析を行いました．

# おわりに

今回はとても表面的な部分しか触っていませんがうまく活用することで可能性は広がっていくのではないでしょうか．
HealthKitのAPIを用いることでより効率的にできるかもしれませんが，今回の手法だと認証などは一切せずにできるのでとても簡単だと思います．
iPhoneユーザーの方はぜひ自分自身の生体データで遊んでみてください．

### 参考文献

[^1]: [IBM Documentation - XML 構文規則](https://www.ibm.com/docs/ja/b2bis?topic=overview-xml-syntax-rules)

[^2]: [Apple HealthKit - Documentation](https://developer.apple.com/documentation/healthkit)
