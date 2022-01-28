const myArgs = process.argv.slice(2)
const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
const { layers, width, height } = require('./input/config')
const { resolve } = require('path')
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')
const editionSize = myArgs.length > 0 ? Number(myArgs[0]) : 1

var metadataList = []
var attributesList = []
var dnaList = []



const saveImage = (_editionCount) => {
    fs.writeFileSync(`./output/${_editionCount}.png`, canvas.toBuffer('image/png'))
}

const signImage = (_editionCount) => {
    ctx.fillStyle = "#000000"
    ctx.font = "bold 40pt Courier"
    ctx.textBaseline = "top"
    ctx.textAlign = "left"
    ctx.fillText("#"+_editionCount, 40, 40)
}

const genColor = () => {
    let hue = Math.floor(Math.random() * 360)
    let pastel = `hsl(${hue}, 100%, 85%)`
    return pastel
}

const drawBackground = () => {
    ctx.fillStyle = genColor()
    ctx.fillRect(0, 0, width, height)
}

const addMetadata = (_dna, _edition) => {
    let dateTime = Date.now()
    let tempMetadata = {
        dna: _dna,
        edition: _edition,
        date: dateTime,
        attributes: attributesList
    }
    metadataList.push(tempMetadata)
    attributesList = []
}

const addAttributes = (_element) => {
    let selectedElement = _element.layer.selectedElement
    attributesList.push({
        name: selectedElement.name,
        rarity: selectedElement.rarity,
    })
}

const loadLayerImg = async (_layer) => {
    return new Promise(async (resolve) => {
        const image = await loadImage(
            `${_layer.location}${_layer.selectedElement.fileName}`
        )
        resolve({ layer: _layer, loadedImage: image })
    })
}

const drawElement = (_element) => {
    ctx.drawImage(
        _element.loadedImage,
        _element.layer.position.x,
        _element.layer.position.y,
        _element.layer.size.width,
        _element.layer.size.height
    )
    addAttributes(_element)
}

const constructLayerToDna = (_dna, _layers) => {
    let DnaSegment = _dna.toString().match(/.{1,2}/g)
    let mappedDnaToLayers = _layers.map((layer) => {
        let selectedElement = layer.elements[parseInt(DnaSegment) % layer.elements.length]
        return {
            location: layer.location,
            position: layer.position,
            size: layer.size,
            selectedElement: selectedElement
        }
    })
    return mappedDnaToLayers
}


const isDnaUnique = (_dna, _dnaList = dnaList) => {
    let foundDna = _dnaList.find((i) => i === _dna)
    return foundDna == undefined ? true : false
}

const createDna = (_len) => {
    _len = _len * 2 - 1
    let randNum = Math.floor(Number(`1e${_len}`) + Math.random() * Number(`1e${_len}`))
    return randNum
}

const writeMetadata = (_data) => {
    fs.writeFileSync("./output/_metadata.json", _data)
}


const startCreating = async () => {
    writeMetadata("")
    let editionCount = 1;

    while (editionCount <= editionSize) {
        let newDna = createDna(layers.length)
        // console.log(dnaList)

        if (isDnaUnique(newDna)) {
            let results = constructLayerToDna(newDna, layers)
            let loadedElements = []

            results.forEach(layer => {
                loadedElements.push(loadLayerImg(layer))
            })

            await Promise.all(loadedElements).then(elementArray => {
                drawBackground()
                elementArray.forEach(element => {
                    drawElement(element)
                })
                signImage(editionCount)
                saveImage(editionCount)
                addMetadata(newDna, editionCount)
                // console.log(`Created Edition: ${editionCount} with DNA: ${newDna}`)
            })
            dnaList.push(newDna)
            editionCount++
        } else {
            console.log('Dna exists')
        }
    }
    writeMetadata(JSON.stringify(metadataList))
}


startCreating()

