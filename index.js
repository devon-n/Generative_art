const myArgs = process.argv.slice(2)
const fs = require('fs')
const { createCanvas, loadImage }  = require('canvas')
const { layers, width, height } = require('./input/config')
const { resolve } = require('path')
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')
const editionSize = myArgs.length > 0 ? Number(myArgs[0]) : 1

var metadata = []
var attributes = []
var hash = []
var decodedHash = []
var dnaList = []



const saveLayer = (_canvas, _editionSize) => {
    fs.writeFileSync(`./output/${_editionSize}.png`, _canvas.toBuffer('image/png'))
}

const addMetadata = (_editionSize) => {
    let datetime = Date.now()
    let tempMetadata = {
        hash: hash.join(""),
        decodedHash: decodedHash,
        editionSize: _editionSize,
        date: datetime,
        attributes: attributes
    }
    metadata.push(tempMetadata)
    attributes = []
    hash = []
    decodedHash = []
}

const addAttributes = (_element, _layer) => {
    let tempAttr = {
        id: _element.id,
        layer: _layer.name,
        name: _element.name,
        rarity: _element.rarity
    }
    attributes.push(tempAttr)
    hash.push(_layer.id)
    hash.push(_element.id)
    decodedHash.push({[_layer.id]: _element.id})
}

const loadLayer = async (_layer) => {
    return new Promise(async() => {
        const image = await loadImage(`${_layer.location}${element.fileName}`)
        resolve({layer: _layer, loadedImage: image})
    })
}

const drawElement = (_element) => {
    ctx.drawImage(image, _layer.position.x, _layer.position.y, _layer.size.width, _layer.size.height)
    addAttributes(_element)
}

const constructLayerToDna = (_dna, _layer) => {
    let DnaSegment = _dna.toString().match(/.{1,2}/)
    console.log(DnaSegment)
}


const isDnaUnique = (_dnaList = [1,2], _dna) => {
    let foundDna = _dnaList.find((i) => i === _dna)
    return foundDna == undefined ? true : false
    return true
}

const createDna = (_len) => {
    _len = _len * 2 - 1
    let randNum = Math.floor(Number(`1e${_len}`) + Math.random() * Number(`1e${_len}`))
    return randNum
}

const writeMetadata = () => {
    fs.writeFileSync("./output/_metadata.json", JSON.stringify(metadata))
}


const startCreating = () => {
    let editionCount = 1;
    while(editionCount <= editionSize) {
        let newDna = createDna(layers.length)
        console.log(newDna)

        if(isDnaUnique(newDna)){
            let result = constructLayerToDna(newDna, layers)

            // addMetadata(editionCount)
            console.log('Creating edition ', editionCount)
            dnaList.push(newDna)
            editionCount++
        } else {
            console.log('Dna exists')
        }
        
    }
}


startCreating()
writeMetadata()
