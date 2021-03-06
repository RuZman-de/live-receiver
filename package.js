/*
**  Live Video Experience (LiVE)
**  Copyright (c) 2020 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const os    = require("os")
const path  = require("path")
const glob  = require("glob")
const shell = require("shelljs")
const execa = require("execa")
const zip   = require("cross-zip")

;(async () => {
    const electronpackager = path.resolve(path.join("node_modules", ".bin", "electron-packager"))

    console.log("++ cleanup")
    shell.rm("-rf", "LiVE-Receiver-win32-x64")
    shell.rm("-rf", "LiVE-Receiver-darwin-x64")
    shell.rm("-f", "LiVE-Receiver-win32-x64.zip")
    shell.rm("-f", "LiVE-Receiver-darwin-x64.zip")

    console.log("++ packaging App as an Electron distribution")
    const remove = glob.sync("node_modules/typopro-web/web/TypoPRO-*")
        .filter((path) => !path.match(/\/TypoPRO-(SourceSansPro|DejaVu)$/))
    for (const file of remove)
        shell.rm("-rf", file)
    let ignore = []
    ignore.push("node_modules/electron-prebuilt")
    ignore.push("node_modules/electron-packager")
    ignore = ignore.concat(glob.sync("*.ai"))
    if (os.platform() === "win32") {
        ignore.push("ffmpeg/ffmpeg-mac-x64")
        ignore.push("ffmpeg/ffmpeg-mac-x64\\.sh")
        execa.sync(electronpackager, [
            ".",
            "LiVE-Receiver",
            "--platform=win32",
            "--arch=x64",
            "--asar.unpackDir=ffmpeg",
            "--ignore", "(?:" + ignore.join("|") + ")",
            "--overwrite"
        ])

        console.log("++ packing App into ZIP archive")
        shell.rm("-f", "LiVE-Receiver-win32-x64/LICENSE*")
        shell.rm("-f", "LiVE-Receiver-win32-x64/version")
        zip.zipSync(
            path.join(__dirname, "LiVE-Receiver-win32-x64"),
            path.join(__dirname, "LiVE-Receiver-win32-x64.zip")
        )
    }
    else if (os.platform() === "darwin") {
        ignore.push("ffmpeg/ffmpeg-win-x64\\.exe")
        execa.sync(electronpackager, [
            ".",
            "LiVE-Receiver",
            "--platform=darwin",
            "--arch=x64",
            "--asar.unpackDir=ffmpeg",
            "--ignore", "(?:" + ignore.join("|") + ")",
            "--app-bundle-id=com.engelschall.apps.live.receiver",
            "--app-category-type=com.engelschall.apps",
            "--protocol=live",
            "--protocol-name=LiVE",
            "--overwrite"
        ])

        console.log("++ packing App into ZIP archive")
        shell.rm("-f", "LiVE-Receiver-darwin-x64/LICENSE*")
        shell.rm("-f", "LiVE-Receiver-darwin-x64/version")
        zip.zipSync(
            path.join(__dirname, "LiVE-Receiver-darwin-x64"),
            path.join(__dirname, "LiVE-Receiver-darwin-x64.zip")
        )
    }
})().catch((err) => {
    console.log(`** ERROR: ${err}`)
})

