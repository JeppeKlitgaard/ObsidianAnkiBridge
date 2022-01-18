_ = [ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]
Newline = '\n'
Integer = digits:[0-9]+ {return parseInt(digits.join("", 10))}


AnkiTagRoot = _* '#anki'
TagDelim = '/'
AnkiTag = AnkiTagRoot TagDelim

AnkiStart = AnkiTag 'start' {return "AnkiStart"}
AnkiFront = AnkiTag 'front' {return "AnkiFront" }
AnkiBack = AnkiTag 'back' {return "AnkiBack" }
AnkiEnd = AnkiTag 'end' {return "AnkiEnd" }
AnkiMiddle = AnkiTag '---' {return "AnkiMiddle" }
AnkiDelete = AnkiTag 'delete' {return "AnkiDelete" }

AnkiID = '%% ID: ' id:Integer ' %%' {return id}

MiscChar = !Newline c:. {return c}
MiscLine = c:($($MiscChar+ Newline?) / $MiscChar + / $(Newline)) {return {"type": "line", "text": c}}

AnkiConfigCodeBlockStart = '```anki-config'
AnkiConfigCodeBlockEnd = '```'
AnkiConfigCodeBlock =
    AnkiConfigCodeBlockStart _* Newline
    content:(!(AnkiConfigCodeBlockEnd _* Newline) line:MiscLine {return line})*
    AnkiConfigCodeBlockEnd _* Newline
    { return linesToStr(content) }

AnkiCodeBlockStart = '```anki'
AnkiCodeBlockEnd = '```'
AnkiCodeBlock =
    AnkiCodeBlockStart _* Newline
    content:(!(AnkiCodeBlockEnd _* Newline) line:MiscLine {return line})*
    AnkiCodeBlockEnd _* Newline
    {return linesToStr(content)}
