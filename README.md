# jquery.forceAsync

どんなスクリプトも強制的に非同期読み込みするjQueryプラグイン

## 概要

- `document.write`を使っているため非同期化できないレガシースクリプトを、iframeに書き出すことでブロックせずに読み込みます。
- 読み込みは`$(document).ready()`で開始するので`defer`的ですが、読み込み終わるとすぐに実行されるので`async`のように動きます。
- いずれ、より早い段階で読み込む方法も用意します。（ToDo）

## 使い方

1. まず、`dist/`以下のファイルをサーバに置きます。（ここでは`/js/jquery.forceAsync`に置いたものとします。）

1. 非同期化したいスクリプトの`script`タグを`noscript`に変更して`data-forceAsync`属性を追加し、ページのどこかに
  
  ```html
  <script src="/js/jquery.forceAsync/jquery.forceAsync.min.js"></script>
  <script>$.forceAsync.config({path:'/js/jquery.forceAsync'});</script>
  ```
  
  を記述します。<br/>

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
/* scriptタグを動的に生成し、それがさらにscriptをdocument.writeするような、複雑怪奇なスクリプト */
// -->
</script>
```

こうするだけ。スクリプト自体に手を入れる必要はありません。

```html
<noscript data-forceAsync>
<!--
/* scriptタグを動的に生成し、それがさらにscriptをdocument.writeするような、複雑怪奇なスクリプト */
// -->
</noscript>
```

※元のスクリプトがコメントタグで囲まれていなくても、noscriptにするのでコメントタグで囲んだほうがよいです。

### script要素の属性について

元のscriptタグに`charset`などの属性が指定されている場合は、そのまま指定しておいてください。
あくまで`script`を`noscript`に変更し、`data-forceAsync`属性を追加するだけです。

## 注意

- このプラグインはまだ実験段階です。
- 古いIEでは動かない可能性が高いです。（IE11、Chrome、Firefoxでは動作するようです。）
- スクリプトの内容によっても正しく動かない可能性があります。

