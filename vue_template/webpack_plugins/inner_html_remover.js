const { Compilation, sources } = require('webpack');
const path = require('path');

const vuetify_inner_html_patterns = [
    {
        pattern: "this.checkOrCreateStyleElement() && (this.styleEl.innerHTML = val);",
        text: "throw new Error('innerHTML is not supported.');"
    },
    {
        pattern: 'svgContainer.innerHTML = "<svg>" + cur + "</svg>";',
        text: "throw new Error('innerHTML is not supported.');"
    }
];

class InnerHtmlRemoverPlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap("InnerHtmlRemoverPlugin", (compilation) => {
            compilation.hooks.processAssets.tap({
                name: "InnerHtmlRemoverPlugin",
                stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
            }, (assets) => {
                for (const [name, source] of Object.entries(assets)) {
                    let source_text = source.source();
                    vuetify_inner_html_patterns.forEach(({ pattern, text }) => {
                        source_text = source_text.replace(pattern, text);
                    });
                    compilation.updateAsset(name, new sources.RawSource(source_text));
                };
            });
        });
    }
}

module.exports = InnerHtmlRemoverPlugin
