#!/bin/bash
#jsGoogleCompiler --compilation_level ADVANCED_OPTIMIZATIONS --js resloader.js --js_output_file resloader-min.js
jsGoogleCompiler --compilation_level SIMPLE_OPTIMIZATIONS --js resloader.js --js_output_file resloader-min.js
#jsYuiCompressor --charset utf-8 -o resloader-yui-min.js resloader.js