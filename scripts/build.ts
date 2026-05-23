import esbuild from "esbuild";

const isWatch = Deno.args.includes("--watch");

const outdir = isWatch
  ? "./example/.obsidian/plugins/bases-chart-layouts"
  : "./dist";

const cleanEchartsPlugin: esbuild.Plugin = {
  name: "clean-echarts-and-obsidian-compliance",
  setup(build) {
    build.onLoad(
      { filter: /node_modules\/(echarts|zrender)\/.*\.js$/ },
      async (args) => {
        let contents = await Deno.readTextFile(args.path);

        contents = contents.replace(
          /\bnew\s+Function\b/g,
          "(() => { throw new Error('Dynamic functions are blocked'); })",
        );
        contents = contents.replace(
          /\bFunction\((['"])[^'"]+\1\)/g,
          "(() => { throw new Error('Dynamic code execution is blocked'); })",
        );

        contents = contents.replace(
          /\batob\(([^)]+)\)/g,
          "Buffer.from($1, 'base64').toString('binary')",
        );
        contents = contents.replace(
          /\bbtoa\(([^)]+)\)/g,
          "Buffer.from($1, 'binary').toString('base64')",
        );

        return { contents, loader: "js" };
      },
    );
  },
};

const config: esbuild.BuildOptions = {
  entryPoints: ["./src/main.ts", "./src/styles.css"],
  outdir,
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch ? "inline" : false,
  treeShaking: true,
  format: "cjs",
  target: "es2018",
  platform: "node",
  external: ["obsidian"],
  logLevel: "info",
  plugins: [cleanEchartsPlugin],
  define: {
    "eval": "undefined",
    "globalThis.eval": "undefined",
  },
};

if (isWatch) {
  const context = await esbuild.context(config);
  await context.watch();
  await copyManifest();
} else {
  await esbuild.build(config);
  await copyManifest();
  Deno.exit(0);
}

async function copyManifest() {
  const content = await Deno.readTextFile("./manifest.json");
  await Deno.writeTextFile(`${outdir}/manifest.json`, content);
}
