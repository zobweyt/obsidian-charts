import esbuild from "esbuild";

const isWatch = Deno.args.includes("--watch");

const exampleVaultPluginDir = "./example/.obsidian/plugins/charts";
const outdir = isWatch ? exampleVaultPluginDir : "./dist";

if (isWatch) {
  Deno.mkdir(exampleVaultPluginDir, { recursive: true });
}

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
