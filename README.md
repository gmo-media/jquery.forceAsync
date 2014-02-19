# jquery.forceAsync

どんなスクリプトも強制的に非同期読み込みするjQueryプラグイン

- `document.write`を使っているため非同期化できないレガシーなスクリプトを、iframeに書き出すことでブロックせずに読み込みます。
- scriptタグによるレンダリングのブロックが起きなくなるので、ページ表示の体感速度が上がります。
- サードパーティのスクリプトを利用している場合に、配信サーバの障害でページが表示できなくなるなどの影響を回避できます。

## 使い方

1. まず、`dist/`以下のファイルをサーバに配置します。（ここでは`../jquery/forceAsync/`に配置したものとします。）
  - スクリプトはCDNなどに置いても構いませんが、`forceAsync.html`だけはサイトと同じサーバに置いてください。（正確には同じオリジンで参照できる場所）

1. 次に、ページのどこか（jQuery本体の読み込みより後）に以下のタグを記述します。
  
  ```html
  <script src="../jquery/forceAsync/jquery.forceAsync.min.js"></script>
  <script>$.forceAsync.config({path:'../jquery/forceAsync/'});</script>
  ```
  - `path`には`forceAsync.html`へのパスを指定してください。絶対パスでも大丈夫です。

1. 最後に、非同期化したいスクリプトの`script`タグを`forceasync`タグに変更します。閉じタグを直すのも忘れずに。

### `src`属性でJavaScriptファイルを指定しているもの

```html
<script src="legacy.js"></script>
```

こういうのはタグを直すだけでOK。
もし、`charset`などの属性があるときはそのまま指定しておいてください。

```html
<forceasync src="legacy.js"></forceasync>
```

### インラインスクリプトでscriptタグを生成しているもの

```html
<script>
<!--
/* document.writeでscriptタグを生成している複雑なスクリプト */
// -->
</script>
```

こういうのもタグを直すだけ。
もし、元のスクリプトがコメントタグで囲まれていない場合はコメントタグで囲んでください。

```html
<forceasync>
<!--
/* document.writeでscriptタグを生成している複雑なスクリプト */
// -->
</forceasync>
```

### 早期読み込み

スクリプトを読み込みは`$(document).ready()`で始めるので、ページのボリュームなどによっては読み込みがなかなか始まりません。
そのような場合は次のコードを任意の場所に書いてください。

```html
<script>$.forceAsync.exec();</script>
```

このコードはそれまでにforceAsync指定したスクリプトを読み込み始めます。
`forceasync`タグごとに書いてもいいし、いくつかの指定の後に書いても構いません。

※`$(document).ready()`では`$.forceAsync.exec()`を呼んでいるだけです。

## 注意

- このプラグインはまだ実験段階です。
- スクリプトの内容によっても正しく動かない可能性があります。

## 動作を確認した環境

以下の環境でdemoのHTMLが動作することを確認しています。

### Windows

- Internet Explorer
  - IE11 - Win8.1? / Win7
  - IE10 - Win8 / Win7?
  - IE9 - Win7
  - IE8 - WinXP
  - IE7 - Vista 未対応
- Chrome 32.0
- Firefox 27.0
- Opera 19.0

### Mac

- Safari 未検証
- Chrome 未検証
- Firefox 未検証

### iOS

- Safari - iOS7

### Android

- Browser - 未検証

## 分かっている問題

- スクリプトが出力するコンテンツがマージンを持っている場合、その前後の要素が持つマージンとの相殺（マージンの重なり）は行われなくなります。

