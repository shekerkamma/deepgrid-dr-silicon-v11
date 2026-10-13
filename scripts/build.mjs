// Vinext calls process.exit immediately after closing its prerender server.
// On Windows, allow pending native handle-close callbacks to drain first.
const exit = process.exit.bind(process);
if (process.platform === 'win32') {
  process.exit = (code) => {
    if (code !== undefined && code !== 0) return exit(code);
    process.exitCode = 0;
    setTimeout(() => exit(process.exitCode ?? 0), 1500);
  };
}
// Render the static route catalogue serially. Concurrent prerender workers intermittently omitted
// fixed routes or failed their internal fetches on this host; the Pages route gate correctly blocks that export.
process.argv = [process.argv[0], 'vinext', 'build', '--prerender-concurrency', '1', ...process.argv.slice(2)];
await import('../node_modules/vinext/dist/cli.js');

