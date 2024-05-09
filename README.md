<h2 align='center'><samp>vite-plugin-abbrlink</samp></h2>

<p align='center'>Add the abbrlink attribute to the markdown file in the specified directory</p>

<br>

According to [hexo-abbrlink](https://github.com/Rozbo/hexo-abbrlink) functional logic implementation



## 🏁 Installation

Install the package as a development dependency:

```bash
npm i vite-plugin-abbrlink
```

## 🚀 Usage

Add it to your plugins in `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import vitePluginAbbrLink from 'vite-plugin-abbrlink'

export default defineConfig({
  plugins: [
    plugins: [vitePluginAbbrLink({
      paths:['src/content/**/*.md'],
      alg:'crc32'
    })]
  ],
})
```



## 🛠️ Options

### `paths`

**Type:**`string | string[]`

**Default:**`[]`

To set up the md file in the directory you need, use regular expressions, such as src/content/**/*.md



### `alg`

**Type:**`'crc32' | 'crc16'`

**Default:** `crc32`

Algorithm (currently supports crc16 and crc32, default is crc16)



## Sample

The generated link will look like the following:

```
crc16
https://tangerball.com/posts/66c8
```

```
crc32 & hex
https://tangerball.com/posts/8ddf18fb
```
