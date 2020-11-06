const fixLength = (data) => {
    let maxLenInput = -1
    for(let i=0; i<data.length; i++){
        maxLenInput = Math.max(data[i].input.length, maxLenInput)
    }
    for(let i=0; i<data.length; i++){
        while(data[i].input.length < maxLenInput){
            data[i].input.push(0)
        }
    }

    return data
}

const encode = (d) => {
    let arr = new Array()
    d.split(' ').map(c => {
        arr.push(c.charCodeAt(0)/255)
    })
    return arr
}

const encodeData = (data) => {
    return data.map(e => {
        return (
            {
                input: encode(e.input),
                output: e.output
            }
        )
    })
}

const serialize = data => fixLength(encodeData(data))

export default {
    serialize: serialize,
    encode: encode,
    fixLength: fixLength
}