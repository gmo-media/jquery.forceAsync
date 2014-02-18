# jquery.forceAsync

どんなスクリプトも強制的に非同期読み込みするjQueryプラグイン

- `document.write`を使っているため非同期化できないレガシーなスクリプトを、iframeに書き出すことでブロックせずに読み込みます。
- scriptタグによるレンダリングのブロックが起きなくなるので、ページ表示の体感速度が上がります。
- サードパーティのスクリプトを利用している場合に、配信サーバの障害でページが表示できなくなるなどの影響を回避できます。

## 使い方

1. まず、`dist/`以下のファイルをサーバに配置します。（ここでは`/js/jquery.forceAsync`に配置したものとします。）

  - スクリプトはCDNなどに置いても構いませんが、`forceAsync.html`だけはサイトと同じサーバに置いてください。（正確には同じオリジンで参照できる場所）

1. ページの`head`タグ内に以下の内容を記述します。
  
  ```html
  <script src="//code.jquery.com/jquery.min.js"></script>
  <script src="/js/jquery.forceAsync/jquery.forceAsync.min.js"></script>
  <script>$.forceAsync.config({path:'/js/jquery.forceAsync'});</script>
  ```

  - jQuery本体はサイトで利用しているものを指定してください。
  - `path`には`forceAsync.html`のパスを指定してください。そのページからの相対パスでも大丈夫です。

1. 非同期化したいスクリプトの`script`タグを`noscript`に変更し、`data-forceAsync`属性を追加します。

### 外部ファイルを非同期化する

こういうのは

```html
<script src="legacy.js"></script>
```

こうします。閉じタグ直すのも忘れずに。

```html
<noscript src="legacy.js" data-forceAsync></noscript>
```

### インラインスクリプトを非同期化する

ごちゃごちゃしたネットワーク広告みたいなやつも

```html
<script>
<!--
/* document.writeでscriptタグを生成している複雑なスクリプト */
// -->
</script>
```

こうするだけ。スクリプト自体に手を入れる必要はありません。

```html
<noscript data-forceAsync>
<!--
/* document.writeでscriptタグを生成している複雑なスクリプト */
// -->
</noscript>
```

元のスクリプトがコメントタグで囲まれていなくても、noscriptに変えるのでコメントタグで囲んだほうがよいです。

### 早期読み込み

各スクリプトの読み込みは`$(document).ready()`のタイミングで始まるので、ページのボリュームが大きいとスクリプトが実行されるまでの時間も遅くなります。

そのような場合は以下のコードを任意の位置に記述することで、それまでに非同期化指定したスクリプトを読み込み始めることができます。

```html
<script>$.forceAsync.exec();</script>
```

これは非同期化指定したスクリプトごとに書いてもいいし、いくつかの指定の後に書いても構いません。

※`$(document).ready()`は`$.forceAsync.exec()`を呼んでいるだけです。

### script要素の属性について

元のscriptタグに`charset`などの属性が指定されている場合は、そのまま指定しておいてください。
あくまで`script`を`noscript`に変更し、`data-forceAsync`属性を追加するだけです。

## 注意

- このプラグインはまだ実験段階です。
- 古いIEでは動かない可能性が高いです。（IE11、Chrome、Firefoxでは動作するようです。）
- スクリプトの内容によっても正しく動かない可能性があります。

