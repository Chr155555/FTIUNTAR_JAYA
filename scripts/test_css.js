async function main() {
  const res = await fetch('http://localhost:3000/peta');
  const html = await res.text();
  const cssMatches = html.match(/href="(\/_next\/static\/css\/[^"]+)"/g);
  console.log('Matches:', cssMatches);
  if (cssMatches) {
    for (const m of cssMatches) {
      const url = m.replace('href="', '').replace('"', '');
      const cssRes = await fetch('http://localhost:3000' + url);
      const css = await cssRes.text();
      console.log(url, 'has maplibregl?:', css.includes('maplibregl'));
      console.log(url, 'has maplibregl-canvas?:', css.includes('maplibregl-canvas'));
    }
  }
}
main().catch(console.error);
