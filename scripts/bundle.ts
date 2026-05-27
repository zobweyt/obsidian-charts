const watch = Deno.args.includes("--watch");
const outdir = "./dist";
const manifest = "manifest.json";

if (watch) {
  const launcher = new Deno.Command("deno", {
    args: [
      "run",
      "--no-lock",
      "-A",
      "npm:obsidian-launcher",
      "watch",
      "--version",
      "1.10.3",
      "--installer",
      "1.10.3",
      "--plugin",
      outdir,
      "./sandbox",
    ],
    stdout: "inherit",
    stderr: "inherit",
  })
  
  launcher.spawn();
}

const bundler = new Deno.Command("deno", {
  args: [
    "bundle",
    "./src/main.ts",
    "./src/styles.css",
    "--outdir",
    outdir,
    "--minify",
    "--format=cjs",
    "--platform=browser",
    "--external=obsidian",
    ...Deno.args,
  ],
  stdout: "inherit",
  stderr: "inherit",
});

await Deno.mkdir(outdir, { recursive: true });
await Deno.copyFile(`./${manifest}`, `${outdir}/${manifest}`);

bundler.spawn();
