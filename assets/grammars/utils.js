function linesToStr(lines) {
    let str = ''
    lines.forEach((lineObj) => {
        str += lineObj.text
    })

    return str
}
