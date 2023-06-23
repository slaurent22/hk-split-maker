# ![](src/asset/image/favicon-tiny.png) HK Split Maker

Write a small configuration for Hollow Knight splits and a produce a full LiveSplit file. List your triggers once, and get both the autosplitter settings and the segment list from that list!

The configuration is as simple as this. List the autosplit triggers once and add some metadata.

![JSON Configuration for Aluba%](./doc/img/aluba.json.PNG)

The resulting splits have icons!

![LiveSplit screenshot of the generated Aluba% Splits](./doc/img/aluba.lss.PNG)

The autosplits are ordered and correct.

![LiveSplit screenshot of the generated Aluba% Splits' settings](./doc/img/aluba.autosplits.PNG)

## Use

Use the [HK Split Maker web UI](https://hksplitmaker.com/)!
You can load a builtin category or customize your own.
Once the configuration is loaded or written, click Generate then Download.
Open the resulting lss file with LiveSplit.

## Development

For development or local use, clone the repository and install/build manually via [Node.js](https://nodejs.org/en/).

```sh
npm install --legacy-peer-deps && npm run serve
```

Navigate to `http://localhost:8080/` in your web browser.

### Adding new Splits

Copy the contents of `public enum SplitName` from
[HollowKnightSplitSettings.cs](https://github.com/ShootMe/LiveSplit.HollowKnight/blob/master/HollowKnightSplitSettings.cs) into [splits.txt](./src/asset/splits.txt). Remove the commented-out lines. Run `npm run gen-files` to regenerate the core files from those.

## Future Enhancements

You can see the current list of feature ideas in the [GitHub
issues](https://github.com/slaurent22/hk-split-maker/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc). More ideas are
welcome!
