# jquery.forceAsync

どんなスクリプトも強制的に非同期読み込みするjQueryプラグイン。

## 特徴

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

### src属性でJavaScriptファイルを指定しているもの

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

### スクリプトの早期読み込み

スクリプトの読み込みが開始されるのは、forceasyncタグが現れたタイミングではなく`$(document).ready()`です。
そのため、DOMの解析に時間がかかるページでは、forceAsyncを使わない場合よりページの読み込み完了時間が遅くなってしまいます。
少しでも早くスクリプトを読み込みたい場合は、次のコードを`</forceasync>`の後に挿入してください。

```html
<script>$.forceAsync.exec();</script>
```

これはそれまでに現れたすべてのforceasyncタグを実行するので、forceasyncタグごとに書いてもいいし、いくつかの指定の後に書いても構いません。
`$(document).ready()`でもこれを呼んでいるだけです。

## 注意

- このプラグインはまだ実験段階です。
- スクリプトの内容によっては正しく動かない可能性があります。

## 動作を確認した環境

demoのHTMLが動作するか確認した環境です。（確認した環境では全て動いています。）

### Windows

- Internet Explorer
  - IE11 - Win8.1 / Win7
  - IE10 - Win8 / Win7
  - IE9 - Win7
  - IE8 - Win7 / XP
  - IE7 - Vista
- Chrome 32.0
- Firefox 27.0
- Opera 19.0

### Mac

- Safari 7.0
- Chrome 31.0
- Firefox 27.0

### iOS

- Safari - iOS 7.0

### Android

- Browser - Android 4.0

## 分かっている問題

- スクリプトが出力するコンテンツとその前後の要素とのマージンの相殺（マージンの重なり）が発生しません。
- IEは全バージョンとも`$(document).ready()`後に追加したiframeのonloadを待たずにページのonloadが発生するため、早期読み込みしない方が早くonloadが発生しますが、スクリプトの実行まで含めた完了時間は早期読み込みをした方が早いです。
- 2つ以上のスクリプトを読み込む必要があるものはそのままでは動作しません。動かせるようになったらドキュメントに追記します。

