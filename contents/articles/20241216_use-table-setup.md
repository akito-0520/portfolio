---
title: 【React】useTableの使い方
tags: [TypeScript, React]
author: akito-0520
createdAt: "2024-12-16"
updatedAt: "2024-12-16"
description: 【React】useTableの使い方
---

# はじめに

皆さんもweb開発をしている時にテーブルを作成したくなる時があると思います。CSSを頑張っていじって作るのもありかもしれませんが、どうせなら楽をしたいということで今回はuseTableの基本的な使い方を紹介しようと思います。

# 環境

- React v18.3.1
- typeScript v5.6.2
- vite v6.0.3

# 実装

### パッケージのインストール

まずはそれぞれの環境に合ったパッケージ管理ツールでパッケージをインストールします。
今回の環境ではnpmを使用しているのでnpmのやり方でインストールしようと思います。

```bash
npm install @tanstack/react-table
```

### 列定義

次に列定義をしていきます。
テーブルコアからヘルパー関数を呼び出して定義していきましょう。

```typescript
import { createColumnHelper } from "@tanstack/react-table";

type Person = {
  firstName: string;
  lastName: string;
  info: {
    age: number;
    gender: string;
  };
};

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor("firstName", {
    header: "First Name",
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor("lastName", {
    header: "Last Name",
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor("info.age", {
    header: "Age",
    footer: (props) => props.column.id,
  }),
    // Custom Header
  columnHelper.accessor("info.gender", {
    header: () => <span>Gender</span>,
    footer: (props) => props.column.id,
  })
```

headerには基本的に文字列を渡しますが、無名関数を宣言してhtml文法を返り値として返すこともできます。

---

### データを定義

次にテーブルとして表示するデータを定義していきます。これはカラムで定義した型と同じならAPIなどで取得したデータも表示できます。

```typescript
type Person = {
  firstName: string;
  lastName: string;
  info: {
    age: number;
    gender: string;
  };
};

const defaultData: Person[] = [
  { firstName: "John", lastName: "Doe", info: { age: 18, gender: "Men" } },
  { firstName: "Jane", lastName: "Fonda", info: { age: 20, gender: "Men" } },
  { firstName: "Alice", lastName: "Smith", info: { age: 23, gender: "Women" } },
];
```

---

### Tableインスタンスの作成

データとカラムを定義したのでテーブルを表示したい関数の中でインスタンスを作成していきます。

```typescript
function App() {
  const [data, _setData] = useState<Person[]>(() => [...defaultData]);
  const table = useReactTable<Person>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
    </>
  );
}

export default App;
```

今回はstateでdataを状態管理しているのでset関数で中身を変えるとtableのデータを更新することもできます。

---

### テーブルの表示

まずはヘッダを表示します。返り値としてテーブルタグの中にヘッドタグを置き、その中でmap関数をぶん回します。

```typescript
...
<div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroups) => (
            <tr key={headerGroups.id}>
              {headerGroups.headers.map((header) => (
                <th key={headerGroups.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
      </table>
    </div>
```

これでテーブルのヘッダが表示されるようになりました。

![スクリーンショット 2024-12-16 17.36.17.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3771942/2ac9d33e-1880-ac8c-3996-d04977e52a3c.png)

次に実際のデータを表示していきましょう。

```typescript

return (
    <div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroups) => (
            <tr key={headerGroups.id}>
              {headerGroups.headers.map((header) => (
                <th key={headerGroups.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
```

これで基本的なテーブルを表示することができました。

![スクリーンショット 2024-12-16 17.37.20.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3771942/66376afb-c12b-52bb-132d-3d95e7495b32.png)

また、Tableインスタンスを複数作り、データやカラムを変えることで同じコードの中で様々なテーブルを同時に表示することができます。

さらに、インスタンスを作成する際に関数を渡すことで、ソートをしたりカスタムの更新をすることができます。

# まとめ

テーブルを作成するときにCSSを頑張っていじっていた方もuseTableを使いたくなったでしょうか？
私もまだ理解しきれていないのでこれからたくさん使って上手く使えるようになりましょう。
最後まで読んでいただきありがとうございました。

# 参考

[https://tanstack.com/]()
