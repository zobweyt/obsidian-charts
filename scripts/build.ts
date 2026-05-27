import esbuild from "esbuild";

const watch = Deno.args.includes("--watch");
const outdir = "./dist";
const manifest = "manifest.json";

const options: esbuild.BuildOptions = {
  entryPoints: ["./src/main.ts", "./src/styles.css"],
  outdir,
  bundle: true,
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  treeShaking: true,
  format: "cjs",
  target: "es2018",
  platform: "node",
  external: ["obsidian"],
  logLevel: "info",
};

await Deno.mkdir(outdir, { recursive: true });
await Deno.copyFile(`./${manifest}`, `${outdir}/${manifest}`);

if (watch) {
  const context = await esbuild.context(options);
  await context.watch();

  new Deno.Command("deno", {
    args: [
      "run",
      "-A",
      "npm:obsidian-launcher",
      "watch",
      "--version",
      "1.10.3",
      "--plugin",
      "./dist",
      "./sandbox",
    ],
  }).spawn();
} else {
  await esbuild.build(options);
}
