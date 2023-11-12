// ==UserScript==
// @name Keystrokes
// @author AspectQuote
// @version 1
// @desc Shows multiple configurable keys on the HUD + Mouse Movement. Original by KraXen72
// @src
// ==/UserScript==

//You are free to modify it for your own purposes (unpublished)
//if you are going to publish your modification, add a link to the gist and credit KraXen72/AspectQuote :)

// CONFIGURATION VARIABLES
let size = 1.9 //how many rem will one of the keys be in height and width
const color1 = `#262626` // Primary Color of the key UI stuff (background)
const color2 = `#b3b3b3` // Primary Color of the text stuff
const bordercolor = `#4f4f4f`

let color3 = `#ba6413` // Secondary Color of the key UI stuff (like when a key is pressed) (background)
let color4 = `#ffffff` // Secondary Color of the text stuff (like when a key is pressed)

const hiddenkeys = ["CTRL"] // Add a Key here if you don't want it shown on the hud element

// You may want to hide mouse input if you have a high polling rate on your mouse. (higher than double your monitor's refresh rate) it can look really odd.
let hidemouseinput = false // Hides the mouse movement tracker (if you're really *that* performance desperate)
let mouseinputsmoother = 0.15 // If you do choose to play with a high polling rate, you may want to increase this a bit to increase visual clarity.

let prependCSS = ``

let mouseInputSide = `Right`
const mouseInputHTMLParser = new DOMParser()
const mouseInputElement = mouseInputHTMLParser.parseFromString(`<div class='mousemovecontainer'><div class='remsize' style='width: 1rem;'></div><canvas id='mousemovecanvas'></canvas></div>`, `text/html`).body.children[0]
function setMouseInputPosition(side) {
    if (side === `Right`) {
        mouseInputElement.style.left = `100%`
        mouseInputElement.style.right = `unset`
    } else {
        mouseInputElement.style.right = `100%`
        mouseInputElement.style.left = `unset`
    }
}
//ok don't touch it past this point unless you know what you're doing
var keysHTML = ``
var keys = [ //if you use some other keybinds change the keycodes for it here. to get keycodes go to: https://keycode.info
    // When defining your own keybind layout, keep in mind that 'keyname' is just what it appears as! make sure you use the correct keycode.
    // "none" creates blank spaces for your layout, and "break" creates a linebreak
    // {ishidden: true, size: 1} will do the same thing as a "none" but increasing the 'size' attribute will increase the amount of spaces the blank space covers
    { keyCode: `KeyQ`, keyname: "Q" }, { keyCode: `KeyW`, keyname: "W" }, { keyCode: `KeyE`, keyname: "E" }, { keyCode: `KeyR`, keyname: "R" }, "none", { mouse: true, keyname: "LMB", keyCode: 1, size: 2 }, { mouse: true, keyname: "MMB", keyCode: 2, size: 1 }, { mouse: true, keyname: "RMB", keyCode: 3, size: 2 }, "break",
    { keyCode: `KeyA`, keyname: "A" }, { keyCode: `KeyS`, keyname: "S" }, { keyCode: `KeyD`, keyname: "D" }, "none", "none", { mouse: true, keyname: "M5", keyCode: 5, size: 2 }, "none", { mouse: true, keyname: "M4", keyCode: 4, size: 2 }, "break",
    { keyCode: `ShiftLeft`, keyname: "SHIFT", size: 2 }, { keyCode: `Space`, keyname: "SPACE", size: 5 }, { keyCode: 17, keyname: "CTRL", size: 2 },
]

let pressedKeysCount = localStorage.getItem('keystrokespressedkeys')
if (typeof pressedKeysCount === "string") {
    pressedKeysCount = JSON.parse(pressedKeysCount)
} else {
    pressedKeysCount = {mouseKeys: {}}
}

function precisionRound(number, precision = 2) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}
function shortenNum(number) {
    if (number < 1000) {
        return `${number}`
    } else if (number < 1000000) {
        return `${Math.floor(number/1000).toFixed(1)}k`
    } else {
        return `${Math.floor(number/1000000).toFixed(1)}m`
    }
}
function calculateKeySize(keySize = 1) {
    let newkeysize = (keySize || 1) * size
    newkeysize = precisionRound(newkeysize + ((((keySize || 1) - 1) * 0.1) * size))
    newkeysize = `${newkeysize * 2.2}rem`
    return newkeysize
}
keys.forEach(key => {
    if (hiddenkeys.includes(key.keyname)) key.ishidden = true
    if (typeof key === "object" && !key?.ishidden) {
        keysHTML += `<span class='key key${key.keyname.replace(/\ /g, '').toLowerCase()}${key.keyCode}' style='width: ${calculateKeySize(key.size)};'>${key.keyname}<div class='keypresscount'>${shortenNum(((key.mouse) ? pressedKeysCount.mouseKeys[key.keyCode] : pressedKeysCount[key.keyCode]) ?? 0)}</div></span>`
    } else {
        if (key === "break") {
            keysHTML += `<div></div>`
        } else {
            keysHTML += `<span class='key nokey' style='width: ${calculateKeySize(1)};'>NONE</span>`
        }
    }
})
let cssVarRGBs = {}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
setCSSVar = function (key, value) {
    document.querySelector(':root').style.setProperty(`--${key}`, value)
    if (value.match(/^#/)) cssVarRGBs[key] = hexToRgb(value)
}
setCSSVar(`keystrokes-primarycolor`, color1)
setCSSVar(`keystrokes-secondarycolor`, color2)
setCSSVar(`keystrokes-bgcolor`, bordercolor)
setCSSVar(`keystrokes-accentprimarycolor`, color3)
setCSSVar(`keystrokes-accentsecondarycolor`, color4)
setCSSVar(`keystrokes-keypresscountdisplay`, `unset`)
let css = ``
const mountCSS = () => {
    keys.forEach(key => {
        if (typeof key === "object" && key.elem) {
            key.elem.style.width = calculateKeySize(key.size)
        }
        if (document.querySelector(`.keystrokes-hold`)) {
            Array.from(hold.querySelectorAll(`span.key.nokey`)).forEach(separatorElement => {
                separatorElement.style.width = calculateKeySize()
            })
        }
    })
    this._css(css, 'keystrokes', false)
    css = `
        ${prependCSS}
        .keystrokes-hold {
            position: absolute;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            text-align: left;
        }
        .key {
            background: var(--keystrokes-primarycolor);
            color: var(--keystrokes-secondarycolor);
            font-family: gamefont;
            font-size: ${precisionRound((size / 2.7))}rem;
            font-weight: bold;
            border: 3px solid var(--keystrokes-bgcolor);
            border-radius: 5px;
            width: ${size}rem;
            height: ${size}rem;
            box-sizing: border-box;
            display: inline-block;
            text-align: center;
            margin: ${size * 0.1}rem;
            margin-bottom: ${size * 0.4}rem;
            transform: translateY(-${size * 0.2}rem);
            box-shadow: 0px ${size * 0.1}rem 0px var(--keystrokes-accentprimarycolor);
            transition: 0.1s;
            line-height: ${size}rem;
            position: relative;
        }
        .keypresscount {
            position: absolute;
            color: inherit;
            font-size: 0.8em;
            top: 100%;
            right: 0.5em;
            background: inherit;
            border: inherit;
            border-top: none;
            line-height: 1.3;
            padding: 0.3em;
            display: var(--keystrokes-keypresscountdisplay);
        }
        .key-sft, .key-space {
            font-size: ${precisionRound((size / 2))}rem;
        }
        .nokey {
            opacity: 0;
        }
        .active {
            transition: 0s;
            background: var(--keystrokes-accentprimarycolor);
            color: var(--keystrokes-accentsecondarycolor);
            transform: translateY(0rem);
            box-shadow: 0px 0rem 0px var(--keystrokes-secondarycolor);
        }
        .mousemovecontainer {
            position: absolute;
            bottom: 0;
            height: ${size * 5}rem;
            width: ${size * 5}rem;
            margin-left: ${size * 1.2}rem;
            margin-right: ${size * 1.2}rem;
            border: 4px solid var(--keystrokes-bgcolor);
            border-radius: 50%;
            background: var(--keystrokes-primarycolor);
            overflow: hidden;
        }
        .mousemovecontainer:after {
            content: '';
            top: 0;
            left: 50%;
            background: var(--keystrokes-accentprimarycolor);
            width: 2px;
            transform: translateX(-50%);
            height: 100%;
            position: absolute;
        }
        .mousemovecontainer:before {
            content: '';
            top: 50%;
            left: 0;
            background: var(--keystrokes-accentprimarycolor);
            width: 100%;
            transform: translateY(-50%);
            height: 2px;
            position: absolute;
        }
        .mousemovepixel {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size * 0.3}rem;
            height: ${size * 0.3}rem;
            border-radius: 50%;
            background-color: var(--keystrokes-accentsecondarycolor);
            z-index: 1;
        }
        #mousemovecanvas {
            position: relative;
            z-index: 1;
        }
    `
    this._css(css, 'keystrokes', true)
}

const hold = document.createElement("div")
hold.classList.add("keystrokes-hold")
hold.innerHTML = keysHTML
hold.appendChild(mouseInputElement)
document.getElementById("inGameUI").appendChild(hold)
var mousectx;
const mousecanvas = mouseInputElement.querySelector('#mousemovecanvas')
function toggleMouseInputDisplay(value) {
    hidemouseinput = !value
    if (value) {
        mouseInputElement.style.display = `unset`
        mouseMovementSinceLastFrame.x = 0
        mouseMovementSinceLastFrame.y = 0
        renderMouseMoveFrame()
    } else {
        mouseInputElement.style.display = `none`
    }
}
function toggleKeyPressCountDisplay(value) {
    if (value) {
        setCSSVar(`keystrokes-keypresscountdisplay`, `unset`)
    } else {
        setCSSVar(`keystrokes-keypresscountdisplay`, `none`)
    }
}
mousectx = mousecanvas.getContext("2d")
keys.forEach(keyobj => {
    if (typeof keyobj === "object" && !keyobj?.ishidden) {
        keyobj.elem = hold.querySelector(`.keystrokes-hold .key.key${keyobj.keyname.replace(/\ /g, '').toLowerCase()}${keyobj.keyCode}`)
        keyobj.countElem = keyobj.elem.querySelector(`.keypresscount`)
    }
});
function incrementPressedKey(keyCode, mouse) {
    if (mouse) {
        if (!pressedKeysCount.mouseKeys[keyCode]) pressedKeysCount.mouseKeys[keyCode] = 0
        pressedKeysCount.mouseKeys[keyCode]++
        const keyExists = !!keys.find(key => key.keyCode === keyCode && key.mouse === true)
        if (keyExists) keys.find(key => key.keyCode === keyCode && key.mouse === true).countElem.innerHTML = shortenNum(pressedKeysCount.mouseKeys[keyCode])
    } else {
        if (!pressedKeysCount[keyCode]) pressedKeysCount[keyCode] = 0
        pressedKeysCount[keyCode]++
        const keyExists = !!keys.find(key => key.keyCode === keyCode)
        if (keyExists) keys.find(key => key.keyCode === keyCode).countElem.innerHTML = shortenNum(pressedKeysCount[keyCode])
    }
    localStorage.setItem('keystrokespressedkeys', JSON.stringify(pressedKeysCount))
}

var pressingKeys = {}
function handleKeyDown(event) {
    const code = event.code
    incrementPressedKey(code)
    if (code === `Backquote`) debugger
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (code === key.keyCode /*&& !key.elem.classList.contains("active")*/ && key?.elem !== undefined && [false, undefined].includes(pressingKeys[code])) {
            key.elem.classList.add("active")
            pressingKeys[code] = true
        }
    }
}

function handleKeyUp(event) {
    const code = event.code
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (code === key.keyCode /*&& key.elem.classList.contains("active")*/ && key?.elem !== undefined && pressingKeys[code] === true) {
            key.elem.classList.remove("active")
            pressingKeys[code] = false
        }
    }
}

function handleMouseDown(event) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (event.which === key.keyCode && key.mouse /*&& !key.elem.classList.contains("active")*/) {
            key.elem.classList.add("active")
            incrementPressedKey(event.which, true)
        }
    }
}

function handleMouseUp(event) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (event.which === key.keyCode && key.mouse /*&& key.elem.classList.contains("active")*/) {
            key.elem.classList.remove("active")
        }
    }
}

var remchecker = document.querySelector('.remsize')
var heightchecker = document.querySelector('.mousemovecontainer')
var olcanvassize = 0
var mouseMovementSinceLastFrame = {x: 0, y: 0, lastFrame: performance.now()}
function handleMouseMove(event) {
    if (hidemouseinput) return
    mouseMovementSinceLastFrame.y += event.movementY
    mouseMovementSinceLastFrame.x += event.movementX
}
let mouseMovementFrameLimit = 999
function renderMouseMoveFrame(t) {
    if (hidemouseinput) return
    requestAnimationFrame(renderMouseMoveFrame)
    var timeBeforeFrame = (1000 / mouseMovementFrameLimit)
    if (mouseMovementSinceLastFrame.x !== 0 && mouseMovementSinceLastFrame.y !== 0 && (t - mouseMovementSinceLastFrame.lastFrame) > timeBeforeFrame) {
        let mouseInputDecay = (t - mouseMovementSinceLastFrame.lastFrame) * 0.03
        var remsize = remchecker.offsetWidth
        if (olcanvassize !== heightchecker.offsetHeight && heightchecker.offsetHeight !== 0) {
            mousecanvas.height = heightchecker.offsetHeight
            mousecanvas.width = heightchecker.offsetHeight
            olcanvassize = heightchecker.offsetHeight
            mouseMovementSinceLastFrame.x = 0
            mouseMovementSinceLastFrame.y = 0
        }
        const centerOfCanvas = { x: (mousecanvas.width / 2) - 3, y: (mousecanvas.height / 2) - 3 }
        const circleSize = remsize/4.5*size
        const circleOffset = circleSize/3
        var x = mousecanvas.width / 2 + (mouseMovementSinceLastFrame.x * mouseinputsmoother * remsize * 0.1) - circleOffset
        var y = mousecanvas.height / 2 + (mouseMovementSinceLastFrame.y * mouseinputsmoother * remsize * 0.1) - circleOffset

        mousectx.clearRect(0, 0, mousecanvas.width, mousecanvas.height);
        var lineWidth = remsize * 0.3 * size
        let squareOpacity = Math.min(1, Math.max(Math.abs(x - (centerOfCanvas.x)), Math.abs(y - (centerOfCanvas.y))) / (centerOfCanvas.x / 4))
        let pieAngleMod = Math.min(1, Math.max(Math.abs(x - (centerOfCanvas.x)), Math.abs(y - (centerOfCanvas.y))) / (centerOfCanvas.x))
        var pieColor = cssVarRGBs[`keystrokes-accentprimarycolor`]
        pieColor = `rgba(${pieColor.r}, ${pieColor.g}, ${pieColor.b}, ${squareOpacity})`
        const dirX = x - centerOfCanvas.x;
        const dirY = y - centerOfCanvas.y;
        let theta = 0
        if (dirX === 0) {
            theta = 1.5708 // 90 degrees
        } else {
            theta = Math.atan2(dirY, dirX)
        }
        mousectx.beginPath()
        mousectx.moveTo(centerOfCanvas.x, centerOfCanvas.y)
        mousectx.fillStyle = pieColor
        const pieSize = Math.max(0.12, 0.3926991*(1-pieAngleMod)) // 22.5deg
        mousectx.arc(centerOfCanvas.x, centerOfCanvas.y, mousecanvas.width, theta - pieSize, theta + pieSize)
        mousectx.fill()
        mousectx.closePath()

        // mousectx.beginPath()
        // mousectx.moveTo(centerOfCanvas.x, centerOfCanvas.y)
        // mousectx.lineTo(x, y)
        // mousectx.strokeStyle = color3
        // mousectx.lineWidth = lineWidth
        // mousectx.lineCap = "round"
        // mousectx.stroke()
        // mousectx.closePath()
        mousectx.beginPath()
        mousectx.fillStyle = color4
        mousectx.arc(x, y, circleSize, 0, 2 * Math.PI)
        mousectx.fill()
        mousectx.closePath()

        mouseMovementSinceLastFrame.x = Math.floor(mouseMovementSinceLastFrame.x * (1-mouseInputDecay)) // % mousecanvas.width
        mouseMovementSinceLastFrame.y = Math.floor(mouseMovementSinceLastFrame.y * (1-mouseInputDecay)) // % mousecanvas.height
    }
    mouseMovementSinceLastFrame.lastFrame = performance.now()
}
renderMouseMoveFrame()

document.addEventListener("keydown", handleKeyDown)
document.addEventListener("keyup", handleKeyUp)

document.addEventListener("mousedown", handleMouseDown, { capture: true }) // capture: true, because when krunker hides our cursor, it changes the firing element to some weird bullshit
document.addEventListener("mouseup", handleMouseUp)

document.addEventListener("mousemove", handleMouseMove, { capture: true })

mountCSS()
setMouseInputPosition(mouseInputSide)
toggleKeyPressCountDisplay(false)

this.unload = () => {
    document.removeEventListener("keydown", handleKeyDown)
    document.removeEventListener("keyup", handleKeyUp)

    document.removeEventListener("mousedown", handleMouseDown, { capture: true }) // we have to remember that capture events are different from normal ones, we have to remove it separately
    document.removeEventListener("mouseup", handleMouseUp)

    document.removeEventListener("mousemove", handleMouseMove, { capture: true })

    document.querySelector(".keystrokes-hold").textContent = ""
    document.querySelector(".keystrokes-hold").remove()
    this._css(css, 'keystrokes', false)
}

this.settings = {
    "showMouseInput": { "title": "Show Mouse Input", "desc": "Show the mouse input radar display. Mild performance impact.", "type": "bool", "value": true, changed: (value) => { toggleMouseInputDisplay(value) } },
    "showKeyPressCount": { "title": "Show Key Press Count", "desc": "Show how many times each key has been pressed. Low performance impact.", "type": "bool", "value": false, changed: (value) => { toggleKeyPressCountDisplay(value) } },
    "primaryColor": { "title": "Primary Color", "desc": "Primary color of the keys.", "type": "color", "value": color1, changed: (value) => { setCSSVar(`keystrokes-primarycolor`, value) } },
    "secondaryColor": { "title": "Secondary Color", "desc": "Secondary color of the keys.", "type": "color", "value": color2, changed: (value) => { setCSSVar(`keystrokes-secondarycolor`, value) } },
    "borderColor": { "title": "Border Color", "desc": "Border color of the keys.", "type": "color", "value": bordercolor, changed: (value) => { setCSSVar(`keystrokes-bgcolor`, value) } },
    "primaryAccentColor": { "title": "Primary Accent Color", "desc": "Primary color of the keys while they're pressed.", "type": "color", "value": color3, changed: (value) => { setCSSVar(`keystrokes-accentprimarycolor`, value); color3 = value } },
    "secondaryAccentColor": { "title": "Secondary Accent Color", "desc": "Secondary color of the keys while they're pressed.", "type": "color", "value": color4, changed: (value) => { setCSSVar(`keystrokes-accentsecondarycolor`, value); color4 = value } },
    // "mouseInputFramerate": { "title": "Mouse Framerate", "desc": "Framerate limit of the mouse input display. No effect if it is turned off. Tip: match your FPS cap with this for best results.", type: 'num', min: 15, max: 250, step: 1, "value": mouseMovementFrameLimit, changed: (value) => { mouseMovementFrameLimit = value } },
    "mouseInputPosition": { "title": "Mouse Display Position", "desc": "Which side of the keys the mouse display will be on.", type: 'sel', opts: ['Left', 'Right'], "value": mouseInputSide, changed: (value) => { setMouseInputPosition(value) } },
    "size": { "title": "Display Size", "desc": "Scale of the display. This can take up a large portion of your screen; watch out!", type: 'num', min: 0.1, max: 2, step: 0.05, "value": 1, changed: (value) => { size = value+0.9; mountCSS() } },
}

return this