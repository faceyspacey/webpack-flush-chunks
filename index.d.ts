declare module 'webpack-flush-chunks' {
  import { Stats } from 'webpack';

  // lazy-loading wrapper around the string outputs, in case they are not used.
  interface LazyLoadedString {
    toString: () => string;
  }

  export default function flushChunks(
    stats: Stats,
    options: {
      chunkNames: string[];
      before?: string[];
      after?: string[];

      /**
       * Required only if you want to serve raw CSS.
       * 
       */
      outputPath?: string;
    },
  ): {
    /** JavaScript chunks as a React component */
    Js: React.Component<{}>;

    /** External Stylesheets as a React component */
    Styles: React.Component<{}>;

    /** Raw CSS as a React component */
    Css: React.Component<{}>;

    /** JavaScript chunks */
    js: LazyLoadedString;

    /** External stylesheets */
    styles: LazyLoadedString;

    /** raw CSS */
    css: LazyLoadedString;

    /** Array of filenames */
    scripts: string[];

    /** Array of filenames */
    stylesheets: string[];

    /** Hash object of chunk names to CSS file paths */
    cssHashRaw: Record<string, string>;

    /** `<script>window.__CSS_CHUNKS__ = ${JSON.stringify(cssHashRaw)}</script>` */
    cssHash: LazyLoadedString;

    /** `<script>window.__CSS_CHUNKS__ = ${JSON.stringify(cssHashRaw)}</script>` as a React component */
    CssHash: React.Component<{}>;

    publicPath: string;
    outputPath?: string;
  };
}
