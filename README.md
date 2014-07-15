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

### 他のスクリプトに依存しているもの

```html
<script src="mylib.js"></script>
<script>
<!--
/* mylib.jsを利用したコード */
// -->
</script>
```

このような依存関係がある場合は、タグを直す以外に data-* 属性を設定します。

```html
<forceasync data-name="mylib" src="mylib.js"></forceasync>
<forceasync data-require="mylib">
<!--
/* mylib.jsを利用したコード */
// -->
</forceasync>
```

`data-name`と`data-require`には同じ値を指定します。値は他の設定と重複しなければ何でも構いません。

元のスクリプトが以下のような形になっている場合でも

```html
<script>
<!--
/* exec.jsのための設定 */
// -->
</script>
<script src="exec.js"></script>
```

依存される側に`data-name`、依存する側に`data-require`を設定します。

```html
<forceasync data-name="config">
<!--
/* exec.jsのための設定 */
// -->
</forceasync>
<forceasync data-require="config" src="exec.js"></forceasync>
```

### スクリプトの早期読み込み

スクリプトの読み込みが開始されるのは、forceasyncタグが現れたタイミングではなく`$(document).ready()`です。
そのため、DOMの解析に時間がかかるページでは、forceAsyncを使わない場合よりページの読み込み完了が遅くなってしまいます。
少しでも早くスクリプトを読み込みたい場合は、次のコードを`</forceasync>`の後に挿入してください。

```html
<script>$.forceAsync.exec();</script>
```

これはそれまでに現れたすべてのforceasyncタグを実行するので、forceasyncタグごとに書いてもいいし、いくつかの指定の後に書いても構いません。
`$(document).ready()`でもこれを呼んでいるだけです。

### スクリプトの遅延読み込み

window.onloadが発火する前に新たなリソースを読み込み始めてしまうと、そのリソースが読み込み終わるまでwindow.onloadが待たされます。
もし、できるだけ早くwindow.onloadを発火させたい場合は、`config`メソッドで`delay:true`を指定することで読み込みをwindow.onloadで始めるようにできます。

```html
<script>$.forceAsync.config({path:'../jquery/forceAsync/', delay:true});</script>
```

### スクリプトの自動再読み込み

バナーを表示している場合など、一定時間ごとに内容をリフレッシュしたいことがあります。
そのような場合はforceasyncタグに`data-refresh`属性を指定することで、指定した秒数ごとにスクリプトを再読み込みすることができます。

以下は30秒ごとにスクリプトを再読み込みする例です。

```html
<forceasync data-refresh="30">...</forceasync>
```

- この機能は内部でタイマーを使っていますが、複数のタイマーを同時に使っていると、指定した時間よりも早く時間が進んでしまうようです。そのため、期待する時間よりも長めの時間を指定した方が無難です。
- あまり短い時間を指定すると、window.onloadが発火するより前にスクリプトの再読み込みが始まってしまうため、いつまで経ってもwindow.onloadが発火しないことがあります。window.onloadが発火するだけの十分な時間を取るか、前述の遅延読み込みを行ってください。

## execメソッドの引数について

早期読み込みをするための`exec`メソッドには、以下の形式で引数を渡すことができます。

- `exec(pre_string, post_string)`
    - 出力されるスクリプトタグの前後に文字列を挿入できます。
    - post_stringは省略可能です。
- `exec({オブジェクト})`
    - 以下のコールバック関数を登録できます。
    - `html`
        - 出力するスクリプトタグを加工することができます。
        - 第1引数に元のスクリプトタグの内容が渡されるので、それを加工した内容を返却してください。
    - `load`
        - スクリプトがロードしたiframeのonloadが発火した際（iframeの高さを設定する前）に呼び出されます。
        - 第1引数にforceAsyncオブジェクトが渡されます。

## 注意

- このプラグインはまだ実験段階です。
- スクリプトの内容によっては正しく動かない可能性があります。

## 動作を確認した環境

demoのHTMLが動作することを確認した環境です。

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

- スクリプトが出力するコンテンツとその前後の要素とのマージンの相殺が発生しません。
- IEは全バージョンとも`$(document).ready()`後に追加したiframeのonloadを待たずにページのonloadが発火するため、早期読み込みしない方が早くonloadが発火しますが、スクリプトの実行まで含めた完了時間は早期読み込みをした方が早いです。

